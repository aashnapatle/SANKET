"""
test_real_dataset.py — Ground Truth Local Dataset Integration Tests

Verifies that the backend investigates real accounts from the supplied
2,000,000-row transaction dataset without synthetic fallbacks.
"""
import pytest
from fastapi.testclient import TestClient
import duckdb
from backend.main import app
from backend.db import loader, queries as db
from backend.config import REAL_PARQUET, DUCKDB_PATH

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def ensure_real_dataset_loaded():
    """Ensure DuckDB contains the 100% pure real dataset without synthetic pollution."""
    conn = loader.get_connection()
    count = conn.execute("SELECT COUNT(*) FROM transactions").fetchone()[0]
    if count != 1997748:
        if REAL_PARQUET.exists():
            loader.reset_and_reload_parquet(REAL_PARQUET)


class TestRealDatasetIntegrity:
    """Verify data reconciliation and ground-truth dataset integrity."""

    def test_duckdb_reconciliation(self):
        """DuckDB must have 1,997,748 clean transactions from the 2M local dataset."""
        conn = loader.get_connection()
        count = conn.execute("SELECT COUNT(*) FROM transactions").fetchone()[0]
        assert count == 1997748, f"Expected 1,997,748 rows, got {count}"

    def test_payment_modes_coverage(self):
        """All 4 payment modes in the real dataset must be present."""
        conn = loader.get_connection()
        modes = [
            r[0] for r in conn.execute(
                "SELECT DISTINCT payment_mode FROM transactions"
            ).fetchall()
        ]
        assert set(["UPI", "IMPS", "NEFT", "RTGS"]).issubset(set(modes))

    def test_date_range_validity(self):
        """Date range in DuckDB must match the real dataset window."""
        conn = loader.get_connection()
        min_ts, max_ts = conn.execute(
            "SELECT MIN(timestamp), MAX(timestamp) FROM transactions"
        ).fetchone()
        assert "2026-09-15" in str(min_ts)
        assert "2026-09-29" in str(max_ts)


class TestRealInvestigationPipeline:
    """End-to-end investigation on real accounts from the dataset."""

    REAL_ACCOUNT = "SBIN10012624"

    def test_real_account_investigation_endpoint(self):
        """Full investigation of a real account from the local dataset."""
        response = client.get(f"/api/investigate/{self.REAL_ACCOUNT}?max_hops=2")
        assert response.status_code == 200
        data = response.json()

        # 1. Data source verification
        assert data["data_source"]["type"] == "LOCAL_SUPPLIED_DATASET"
        assert data["data_source"]["dataset_rows"] == 1997748
        assert data["data_label"] == "LOCAL_SUPPLIED_DATASET — Ground Truth Investigation"
        assert data["victim_account"] == self.REAL_ACCOUNT

        # 2. Account summary
        assert data["account"]["account_id"] == self.REAL_ACCOUNT
        assert data["account"]["total_sent"] > 0
        assert data["account"]["transaction_count"] > 0

        # 3. Graph deduplication
        nodes = data["graph"]["nodes"]
        node_ids = [n["id"] for n in nodes]
        assert len(node_ids) == len(set(node_ids)), "Duplicate nodes found in graph"
        assert self.REAL_ACCOUNT in node_ids

        # 4. Directed edges with full traceability
        edges = data["graph"]["edges"]
        assert len(edges) > 0
        for edge in edges:
            assert edge["source"] in node_ids
            assert edge["target"] in node_ids
            assert edge["amount"] > 0
            assert edge["transaction_id"] != ""

        # 5. Multi-hop Transaction Chain
        chain = data["transaction_chain"]
        assert len(chain) > 0
        for item in chain:
            assert item["hop"] >= 0
            assert item["from_account"] != ""
            assert item["to_account"] != ""
            assert item["amount"] > 0

        # 6. Chronological Timeline
        timeline = data["timeline"]
        assert len(timeline) > 0
        timestamps = [e["timestamp"] for e in timeline if e["timestamp"]]
        assert timestamps == sorted(timestamps), "Timeline is not chronological"

        # 7. Taint consistency
        taint = data["taint"]
        assert taint["account_id"] == self.REAL_ACCOUNT
        assert 0.0 <= taint["taint_ratio"] <= 1.0

        # 8. Explainable Risk Score
        risk = data["risk"]
        assert 0.0 <= risk["score"] <= 100.0
        assert risk["label"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

        # 9. Freeze Priority
        freeze = data["freeze_plan"]
        assert "freeze_candidates" in freeze
        assert freeze["total_estimated_recoverable"] >= 0.0

        # 10. Traceable Evidence
        evidence = data["evidence"]
        assert len(evidence) > 0

        # 11. Categorical & Metadata Analyses
        assert len(data["payment_mode_summary"]) > 0
        assert data["ip_analysis"] is not None
        assert data["ip_analysis"]["ip_country"] == "UNAVAILABLE"
        assert data["device_analysis"] is not None
        assert data["cross_bank_analysis"] is not None
        assert data["cycle_analysis"] is not None

        # 12. Explicitly Unavailable Features
        assert data["cash_out_analysis"]["status"] == "UNAVAILABLE_FROM_DATASET"
        assert data["crypto_analysis"]["status"] == "UNAVAILABLE_FROM_DATASET"

    def test_real_judge_demo_endpoint(self):
        """Judge Mode demo endpoint returns ground-truth local data."""
        response = client.get("/api/judge/demo")
        assert response.status_code == 200
        data = response.json()
        assert data["data_source"]["type"] == "LOCAL_SUPPLIED_DATASET"
        assert data["data_source"]["dataset_rows"] == 1997748
        assert "investigation" in data
        assert data["performance"]["investigation_ms"] > 0

    def test_real_benchmark_endpoint(self):
        """Benchmark endpoint returns real measured data."""
        response = client.get("/api/benchmark")
        assert response.status_code == 200
        data = response.json()
        assert data["measured"]["total_dataset_rows"] == 1997748
        assert data["measured"]["real_dataset_investigation_ms"] > 0

    def test_gunjan_detector_and_notice_integration(self):
        """Test Gunjan detector, notice generator, and report exporter integration."""
        from src.graph.detector import FraudGraphDetector
        from src.notice_generator import generate_freeze_notice
        from src.report_exporter import export_investigation_report

        # 1. FraudGraphDetector trace on real account
        detector = FraudGraphDetector()
        trace_res = detector.trace_victim_flow(self.REAL_ACCOUNT, max_hops=2, max_nodes=100)
        assert trace_res["victim_account"] == self.REAL_ACCOUNT
        assert trace_res["total_nodes"] > 0

        # 2. Freeze notice generation
        notice = generate_freeze_notice({
            "account": self.REAL_ACCOUNT,
            "layer": "VICTIM",
            "mule_risk_score": 35.0,
            "flags": ["HIGH_FAN_OUT"],
            "total_in": 117614.16,
            "total_out": 117614.16
        })
        assert notice["account"] == self.REAL_ACCOUNT
        assert "FORMAL NOTICE UNDER SECTION 91 CrPC / PMLA" in notice["notice_text"]

        # 3. Report exporter
        report_json = export_investigation_report(
            case_id="CASE/TEST/001",
            seed_account=self.REAL_ACCOUNT,
            evaluated_nodes=trace_res["nodes"][:10],
            freeze_notices=[notice]
        )
        assert report_json["metadata"]["seed_account"] == self.REAL_ACCOUNT
        assert len(report_json["court_ready_notices"]) == 1

    def test_notice_and_report_export_endpoints(self):
        """Test /api/notice/{account} and /api/reports/export/{account} routes."""
        res_notice = client.get(f"/api/notice/{self.REAL_ACCOUNT}")
        assert res_notice.status_code == 200
        n_data = res_notice.json()
        assert n_data["account"] == self.REAL_ACCOUNT
        assert "SECTION 91 CrPC" in n_data["notice_text"]

        res_report = client.get(f"/api/reports/export/{self.REAL_ACCOUNT}")
        assert res_report.status_code == 200
        r_data = res_report.json()
        assert r_data["metadata"]["seed_account"] == self.REAL_ACCOUNT
