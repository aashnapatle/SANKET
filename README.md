# SANKET — Financial Investigation Console

**An AI-assisted financial investigation platform for tracing suspicious money movement, analysing transaction networks, building evidence, and prioritising potential intervention points.**

## 1. About the Project

SANKET is a financial investigation and transaction analysis platform developed during **VOID HACKS() 8.0 — ABHEDYA**, a 36-hour offline hackathon held at Shri Vaishnav Vidyapeeth Vishwavidyalaya (SVVV), Indore, from 1–3 October 2026.

The hackathon was conducted in collaboration with the **Commissionerate of Police, Indore**. Our team worked with a dataset of approximately **2 million transaction records provided for the challenge**.

The project aims to help investigators examine complex transaction networks, follow the movement of potentially suspicious funds, identify risk indicators, organise supporting evidence, and understand where intervention may have the greatest potential impact.

SANKET is a decision-support prototype intended to assist investigation workflows. Its outputs should be reviewed and verified by authorised investigators.

## 2. Problem Statement

Financial investigations can involve large volumes of transactions, multiple connected accounts, and money moving through several intermediary accounts. Manually examining these relationships can make it difficult to identify suspicious patterns and prioritise investigative leads.

SANKET brings transaction analysis and investigation outputs together in one interface to help users:

- Investigate an account using available transaction data.
- Explore relationships between connected accounts.
- Identify suspicious transaction patterns and risk indicators.
- Trace estimated victim-origin or suspicious fund flows.
- Review transaction timelines and supporting evidence.
- Examine potential account-freezing or intervention priorities.
- Generate investigation reports and AI-assisted narrative summaries.

## 3. Core Features

### 3.1 Account Investigation

Users can initiate an investigation using supported account identifiers. The backend retrieves relevant transaction information and prepares investigation results for the frontend.

The available investigation output brings together account information, risk analysis, transaction relationships, timelines, and evidence.

### 3.2 Transaction Graph Analysis

Transaction relationships can be represented as a connected network of accounts and transfers. Graph analysis helps investigators explore how funds move between accounts and identify potentially relevant connections.

The backend uses graph-processing logic for transaction relationship analysis.

### 3.3 Risk Detection and Scoring

SANKET analyses transaction patterns using deterministic detection and risk-scoring logic.

The investigation pipeline considers configured indicators such as:

- Unusually high numbers of incoming or outgoing transactions.
- Rapid movement of funds through accounts.
- Multi-hop movement across connected accounts.
- Cycles in transaction relationships.
- Cross-bank activity.
- Shared device or IP indicators, where the required metadata is available.

The resulting risk score and associated indicators help prioritise accounts for further examination. A risk score is an investigative signal, not proof of criminal activity.

### 3.4 Taint Analysis

Taint analysis estimates how funds associated with a suspicious or victim-origin transaction may move through connected accounts.

The project's proportional taint model estimates the tainted share of funds and applies that proportion when analysing subsequent transfers.

These results are analytical estimates. They should not be interpreted as exact legal ownership attribution or definitive forensic tracing of individual currency units.

### 3.5 Investigation Timeline

The timeline organises relevant transaction events chronologically using available transaction timestamps.

It helps investigators understand the sequence of transfers, the accounts involved, and how funds may have moved across the transaction network.

### 3.6 Evidence Generation

SANKET assembles investigation evidence from available transaction records and analysis results.

Depending on the investigation, evidence may include transaction references, detected risk indicators, taint-analysis results, and information supporting potential intervention points.

Evidence should remain traceable to the underlying records and analysis. AI-generated narrative is supplementary and should not replace the underlying evidence.

### 3.7 Freeze Recommendations

The freeze-analysis workflow helps identify accounts or network points that may be useful intervention priorities based on the analysed flow of potentially suspicious funds.

These recommendations are intended to help investigators assess where action might have the greatest potential impact. SANKET does not itself execute a bank-account freeze; any action requires the appropriate authorised process.

### 3.8 Investigation Reports

SANKET provides report-generation functionality to organise investigation findings into a report that can be reviewed and used for further investigative work.

The report's contents depend on the information available from the relevant investigation.

### 3.9 AI-Assisted Investigation Narrative

SANKET uses **Ollama with the Qwen3.5:9b model** for AI-assisted investigation narratives.

The model helps express structured investigation findings in more readable language. Deterministic analysis remains responsible for risk scoring and the underlying transaction evidence.

AI-generated text should be treated as an explanatory aid and verified against the source records before being used in formal decisions.

### 3.10 Authentication

The project includes authentication functionality. Access-control behaviour and the exact authentication configuration depend on the current implementation.

## 4. Technology Stack

| Technology | Purpose |
|---|---|
| Next.js and React | Frontend application and user interface |
| TypeScript | Frontend types and application logic |
| Python | Backend investigation and data-processing logic |
| FastAPI | Backend API layer |
| DuckDB | Querying and analysing transaction data |
| Parquet | Column-oriented storage for transaction records |
| Polars | Efficient tabular data processing in the data layer |
| NetworkX | Graph-based transaction relationship analysis |
| Ollama | Local model runtime for AI-assisted narratives |
| Qwen3.5:9b | Language model used for narrative generation |

The documentation does not claim that every technology is used in every investigation request. Their roles depend on the relevant module and workflow.

## 5. High-Level Architecture

The application follows a frontend–backend architecture.

1. **Frontend:** The user initiates an investigation and reviews its results.
2. **FastAPI backend:** Receives requests and coordinates the relevant investigation services.
3. **Data layer:** DuckDB queries transaction records stored in Parquet format.
4. **Transaction and graph analysis:** Relevant transfers and account relationships are analysed.
5. **Risk and taint analysis:** Detection rules, scoring logic, and taint calculations produce investigation indicators.
6. **Evidence and intervention analysis:** The system assembles supporting evidence, timelines, and potential freeze recommendations.
7. **AI narrative:** Ollama and Qwen3.5:9b help explain structured findings in readable language.
8. **Frontend results:** Investigation outputs are presented for review.

**Simplified workflow:**

`Transaction Data → Data Queries → Graph Analysis → Risk Detection → Taint Analysis → Evidence & Timeline → Freeze Recommendations → AI Narrative & Reports`

The actual execution order may vary by endpoint and investigation workflow.

## 6. Dataset and Data Handling

The project was developed against a dataset of approximately **2 million transaction records supplied for the VOID HACKS() 8.0 — ABHEDYA challenge**.

The confirmed data-layer technologies include DuckDB and Parquet. The project also uses Polars for data processing.

The dataset's exact schema, field definitions, data provenance, and privacy classification should be documented from the supplied dataset specification rather than inferred.

The current application is designed to run locally. Public deployment, production readiness, and access to live banking systems are not claimed.

## 7. Running the Project Locally

SANKET is configured for local development. The commands below describe the development workflow; dependencies and environment settings must be configured before running the application.

### Backend

Activate the project's Python virtual environment, install the dependencies listed in `requirements.txt`, configure the required local data paths and environment variables, and start the FastAPI server using the command appropriate to the repository's current entry point.

For a repository configured with `backend.main:app`, the development command is:

```bash
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend

Open a separate terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

The default Next.js development address is commonly `http://localhost:3000`.

The frontend's API configuration must point to the running backend. Confirm the actual environment-variable names and scripts in the current repository before running the application.

**Note:** Local development instructions are not deployment instructions. The project is not documented as a publicly hosted production service.

## 8. Responsible Use and Limitations

- Risk scores indicate patterns requiring review; they do not establish guilt.
- Taint calculations are analytical estimates and depend on the configured model and available data.
- Freeze recommendations are decision-support outputs, not automatic legal or banking actions.
- AI narratives may contain errors and must be checked against underlying records.
- Results depend on the completeness, correctness, and interpretation of the supplied dataset.
- The project should not be treated as a replacement for authorised investigative judgement, legal procedure, or independent evidence verification.
- Production security, deployment readiness, and operational suitability require separate assessment.

## 9. Project Context

**Hackathon:** VOID HACKS() 8.0 — ABHEDYA  
**Format:** 36-hour offline hackathon  
**Venue:** Shri Vaishnav Vidyapeeth Vishwavidyalaya (SVVV), Indore  
**Collaboration:** Commissionerate of Police, Indore  
**Dataset:** Approximately 2 million supplied transaction records  
**Deployment:** Local development environment

## 10. Team

Team Anonymous:

- Aashna Patle
- Gunjan Bhangre
- Ananya Tiwari
- Shreya Patel

## 11. Disclaimer

SANKET is a hackathon-developed investigation-support prototype. Its analytical outputs are intended to help organise and examine transaction information. They do not independently establish criminal conduct, guarantee the recovery or blocking of funds, or replace authorised investigative and legal procedures.
