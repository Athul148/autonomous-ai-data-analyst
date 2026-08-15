# DataPilot AI — Autonomous AI Data Analyst

DataPilot AI is an end-to-end AI-powered data analysis platform that transforms raw datasets into structured insights, visualizations, AI-generated reports, and interactive analytical dashboards.

The platform automates major stages of the data analysis workflow, including dataset profiling, descriptive statistics, data-quality assessment, validation, cleaning, correlation analysis, visualization, AI-assisted interpretation, and dashboard generation.

---

## Key Features

### Dataset Management
- Upload and manage CSV/Excel datasets
- Secure user-specific dataset storage
- Dataset search and deletion
- Dataset metadata including rows, columns, file size, and upload date

### Automated Data Profiling
- Automatic column type detection
- Missing-value analysis
- Unique-value analysis
- Dataset structure summary
- Numeric and categorical column identification

### Descriptive Statistics
Automatically calculates statistical measures for numeric features, including:

- Mean
- Median
- Mode
- Standard deviation
- Variance
- Minimum and maximum
- Quartiles
- Interquartile range (IQR)
- Skewness
- Kurtosis
- Outlier information

Interactive histograms and box plots help users understand individual column distributions.

### Data Quality Analysis
Automatically evaluates dataset health using:

- Quality score
- Missing-value detection
- Duplicate-row detection
- Constant-column detection
- Empty-column detection
- High-cardinality detection
- Memory usage analysis
- Dataset warnings

### Dataset Validation
Performs automated validation across:

- Numeric columns
- Categorical columns
- Identifier columns

The system highlights problematic values and reports the number of affected records.

### Intelligent Data Cleaning
Provides an automated workflow for identifying and handling common data-quality problems and preparing cleaner datasets for downstream analysis and machine-learning workflows.

### Correlation Analysis
- Correlation matrix generation
- Interactive correlation heatmap
- Strong relationship detection
- Positive and negative correlation analysis
- Automated correlation insights

### Automated Visualizations
DataPilot AI automatically recommends and generates suitable visualizations based on dataset structure and detected relationships.

Generated visualizations can include:

- Histograms
- Bar charts
- Pie/donut charts
- Scatter plots
- Box plots
- Correlation visualizations

### AI-Generated Analysis Reports
Integrated generative AI interprets structured analysis results and generates professional reports covering:

1. Executive Summary
2. Business Insights
3. Data Quality Issues
4. Cleaning Recommendations
5. Recommended Visualizations
6. Suggested Next Analysis

Reports can be saved and accessed later from the Reports workspace.

### AI Dataset Chat
Users can interact with their dataset through an AI-powered conversational interface and ask analytical questions using natural language.

### AI Dashboard Generator
Automatically creates multiple dashboard design alternatives from dataset insights.

Users can:

- Generate dashboard alternatives
- Compare different layouts
- Preview dashboard designs
- Select a preferred design
- Generate additional dashboard variations

### Authentication
- User registration
- Secure login
- JWT-based authentication
- Protected application routes
- User-specific datasets and reports

---

## Application Workflow

```text
Register / Login
       ↓
Upload Dataset
       ↓
Dataset Profiling
       ↓
Descriptive Statistics
       ↓
Quality Analysis
       ↓
Dataset Validation
       ↓
Data Cleaning
       ↓
Correlation Analysis
       ↓
Automatic Visualizations
       ↓
AI Report + AI Chat
       ↓
AI Dashboard Generation
```

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React
- Data visualization libraries

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication

### Database

- PostgreSQL

### Data Science

- Pandas
- NumPy
- Statistical analysis
- Automated dataset profiling
- Correlation analysis
- Outlier detection

### Generative AI

- Google Gemini
- Prompt-based analytical interpretation
- AI report generation
- Natural-language dataset interaction
- AI-assisted dashboard generation

---

## Architecture

```text
┌───────────────────────────┐
│       React Frontend      │
│   TypeScript + Tailwind   │
└─────────────┬─────────────┘
              │
              │ REST API
              ▼
┌───────────────────────────┐
│      FastAPI Backend      │
│                           │
│ Authentication            │
│ Dataset Services          │
│ Profiling                 │
│ Statistics                │
│ Quality Analysis          │
│ Validation                │
│ Cleaning                  │
│ Correlation               │
│ Visualization             │
│ AI Services               │
└──────────┬─────────┬──────┘
           │         │
           ▼         ▼
┌──────────────┐  ┌──────────────┐
│ PostgreSQL   │  │  Gemini AI   │
│   Database   │  │              │
└──────────────┘  └──────────────┘
```

---

## Project Structure

```text
autonomous-ai-data-analyst/
│
├── backend/
│   └── app/
│       ├── api/
│       ├── core/
│       ├── models/
│       ├── repositories/
│       ├── schemas/
│       ├── services/
│       └── utils/
│
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       ├── routes/
│       └── types/
│
├── requirements.txt
├── package.json
└── README.md
```

---

## Screenshots

### Login

Add the DataPilot AI login screenshot here.

### Dashboard

Add the main dashboard screenshot here.

### Dataset Workspace

Add the dataset analysis workspace screenshot here.

### AI Dashboard Generator

Add the AI dashboard generator screenshot here.

---

## Local Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd autonomous-ai-data-analyst
```

### 2. Backend Setup

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Create a `.env` file and configure the required environment variables.

Example:

```env
DATABASE_URL=your_postgresql_connection_string
SECRET_KEY=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Never commit the real `.env` file or production credentials to GitHub.

### 4. Run the Backend

```bash
cd backend
uvicorn app.main:app --reload
```

### 5. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local frontend URL displayed by Vite.

---

## Production Build

To verify the frontend production build:

```bash
cd frontend
npm run build
```

---

## Security

- JWT-based authentication
- Protected frontend routes
- User-specific dataset access
- Environment-based secret management
- Sensitive credentials excluded from version control
- Dataset ownership validation on backend endpoints

---

## Future Improvements

Potential future extensions include:

- Machine-learning model recommendation and training
- Time-series analysis
- Advanced anomaly detection
- Automated feature engineering
- Cloud dataset integrations
- Exportable dashboard configurations
- Advanced AI agents for autonomous multi-step analysis
- Background processing for very large datasets

---

## Project Goal

DataPilot AI was developed to demonstrate how traditional data-science workflows, modern web technologies, and generative AI can be combined into a unified autonomous analytics platform.

Rather than requiring users to manually perform every stage of exploratory data analysis, the system provides a structured workflow that assists with understanding, cleaning, analyzing, visualizing, and interpreting datasets.

---

## Author

**Athulkrishna M.A.**

Data Science | AI/ML | Generative AI