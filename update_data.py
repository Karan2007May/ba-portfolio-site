import re

file_path = 'js/data.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_projects = """  projects: [
    {
      id: 'contract-clause-risk',
      imageUrl: 'assets/images/insureai_ui.png',
      title: 'Contract Clause Risk Analyzer & Human Escalation Bot',
      subtitle: 'AI-Powered Contract Review System',
      category: 'AI Automation',
      industry: 'Legal',
      role: 'Business Analyst',
      duration: '4 Months',
      problem: 'Manual review of complex contract clauses is slow and error-prone, requiring a scalable automated solution with human-in-the-loop review.',
      solution: 'An AI-powered system that automatically parses contracts, flags risky clauses, and routes complex cases to human reviewers.',
      contributions: ['Defined the human-in-the-loop escalation workflow', 'Authored prompt guardrails for legal parsing'],
      documents: ['Guardrails BRD', 'Workflow Diagram'],
      result: 'Reduced initial contract screening time significantly.',
      techStack: ['OpenAI', 'Python', 'Make.com'],
      metrics: { 'Screening Time': '-80%' },
      notionUrl: 'https://pine-porter-01d.notion.site/Contract-Clause-Risk-Analyzer-Human-Escalation-Bot-3a9e67c1bc3b80b794bdecb86240a771'
    },
    {
      id: 'patient-relationship-crm',
      imageUrl: 'assets/images/careflow_ui.png',
      title: 'Patient Relationship Service Cloud Implementation',
      subtitle: 'Healthcare CRM Deployment',
      category: 'CRM',
      industry: 'Healthcare',
      role: 'Consultant',
      duration: '5 Months',
      problem: 'Patient data was scattered across legacy systems, resulting in poor patient experiences and disjointed care delivery.',
      solution: 'A unified Salesforce Service Cloud implementation mapping patient journeys to omni-channel care teams.',
      contributions: ['Mapped patient journey workflows', 'Configured Service Cloud SLAs'],
      documents: ['BRD', 'Journey Maps'],
      result: 'Unified patient profiles and improved care coordination.',
      techStack: ['Salesforce Service Cloud', 'Jira'],
      metrics: { 'Care Coordination': '+45%' },
      notionUrl: 'https://pine-porter-01d.notion.site/Patient-Relationship-Service-Cloud-Implementation-3a9e67c1bc3b80e48c22e4f82f809bbb'
    },
    {
      id: 'shopify-wms-sync',
      imageUrl: 'assets/images/logisight_ui.png',
      title: 'Shopify to WMS API Integration Inventory Sync',
      subtitle: 'Automated E-commerce Inventory Sync',
      category: 'SaaS',
      industry: 'E-commerce',
      role: 'Business Analyst',
      duration: '3 Months',
      problem: 'Inventory mismatches between the Shopify storefront and the Warehouse Management System (WMS) caused overselling and order cancellations.',
      solution: 'A real-time API middleware integration syncing inventory counts and order statuses across both systems.',
      contributions: ['Authored API contracts', 'Designed error handling workflows'],
      documents: ['API Specs', 'Error Matrix'],
      result: 'Eliminated overselling and improved order fulfillment rates.',
      techStack: ['REST APIs', 'Postman', 'Shopify'],
      metrics: { 'Overselling': '-100%' },
      notionUrl: 'https://pine-porter-01d.notion.site/Shopify-to-WMS-API-Integration-Inventory-Sync-3a9e67c1bc3b803895c4c705ec49b5f2'
    },
    {
      id: 'gohighlevel-agency',
      imageUrl: 'assets/images/serviceflow_ui.png',
      title: 'GoHighLevel Agency Multi Tenant Setup User Guide',
      subtitle: 'Agency CRM Standardization',
      category: 'CRM',
      industry: 'Marketing',
      role: 'Product Consultant',
      duration: '2 Months',
      problem: 'Marketing agencies needed a standardized setup guide to onboard new tenants rapidly on GoHighLevel with pre-configured workflows.',
      solution: 'A comprehensive multi-tenant architecture and standard operating procedure for client onboarding.',
      contributions: ['Developed standard operating procedures', 'Configured base workflow templates'],
      documents: ['Setup Guide', 'Workflow Templates'],
      result: 'Accelerated new client onboarding process.',
      techStack: ['GoHighLevel', 'Confluence'],
      metrics: { 'Onboarding Time': '-60%' },
      notionUrl: 'https://pine-porter-01d.notion.site/GoHighLevel-Agency-Multi-Tenant-Setup-User-Guide-3aae67c1bc3b80d0940de5ce68e9e210'
    },
    {
      id: 'construction-payroll-automation',
      imageUrl: 'assets/images/procureflow_ui.png',
      title: 'Construction Daily Field Report Payroll Automation',
      subtitle: 'Field Operations Automation',
      category: 'Automation',
      industry: 'Construction',
      role: 'Business Analyst',
      duration: '4 Months',
      problem: 'Site managers spent hours manually compiling daily field reports into payroll systems, resulting in delayed payments and data entry errors.',
      solution: 'An automated pipeline translating daily field logs into structured payroll inputs.',
      contributions: ['Mapped data transformations', 'Led UAT with site managers'],
      documents: ['Data Dictionary', 'UAT Plan'],
      result: 'Eliminated manual data entry and reduced payroll errors.',
      techStack: ['Excel', 'n8n', 'Jira'],
      metrics: { 'Payroll Errors': '-95%' },
      notionUrl: 'https://pine-porter-01d.notion.site/Construction-Daily-Field-Report-Payroll-Automation-3aae67c1bc3b80bdbc8fefc8e04a97dd'
    },
    {
      id: 'hotel-guest-analytics',
      imageUrl: 'assets/images/spacehub_ui.png',
      title: 'Hotel Guest Experience & Revenue Analytics Dashboard',
      subtitle: 'Hospitality BI Dashboard',
      category: 'Data Analytics',
      industry: 'Hospitality',
      role: 'Data Analyst',
      duration: '3 Months',
      problem: 'Hotel management lacked real-time visibility into guest satisfaction scores mapped against daily revenue performance.',
      solution: 'A unified Power BI dashboard aggregating PMS data and guest survey feedback.',
      contributions: ['Defined KPIs with management', 'Built data visualization models'],
      documents: ['KPI Document', 'Dashboard Mocks'],
      result: 'Improved data-driven decision making for hotel operations.',
      techStack: ['Power BI', 'SQL'],
      metrics: { 'Revenue Insights': '+40%' },
      notionUrl: 'https://pine-porter-01d.notion.site/Hotel-Guest-Experience-Revenue-Analytics-Dashboard-3aae67c1bc3b806ba795e551e331ce66'
    },
    {
      id: 'legacy-sap-migration',
      imageUrl: 'assets/images/logisight_ui.png',
      title: 'Legacy SAP to Cloud Inventory Migration',
      subtitle: 'Enterprise Data Migration',
      category: 'Data Analytics',
      industry: 'Logistics',
      role: 'Business Analyst',
      duration: '6 Months',
      problem: 'Transitioning inventory data from an outdated SAP instance to a modern cloud architecture while ensuring zero data loss and minimal downtime.',
      solution: 'A structured migration strategy with comprehensive data mapping and validation protocols.',
      contributions: ['Created field mapping documentation', 'Designed rollback procedures'],
      documents: ['Migration Plan', 'Data Maps'],
      result: 'Successful migration with zero critical data loss.',
      techStack: ['SAP', 'Cloud Infrastructure', 'SQL'],
      metrics: { 'Data Loss': '0%' },
      notionUrl: 'https://pine-porter-01d.notion.site/Legacy-SAP-to-Cloud-Inventory-Migration-3aae67c1bc3b80498d9feae5c5f97824'
    },
    {
      id: 'coworking-saas',
      imageUrl: 'assets/images/spacehub_ui.png',
      title: 'Coworking Space SaaS Booking Platform',
      subtitle: 'Real Estate SaaS Solution',
      category: 'SaaS',
      industry: 'Real Estate',
      role: 'Product Consultant',
      duration: '5 Months',
      problem: 'Coworking spaces struggled with double-bookings and billing errors due to disjointed tools for desk reservations and invoicing.',
      solution: 'An integrated SaaS platform for real-time desk bookings and automated Stripe invoicing.',
      contributions: ['Wrote SRS for booking engine', 'Designed Stripe webhook flows'],
      documents: ['SRS', 'Wireframes'],
      result: 'Eliminated billing leakage and increased space utilization.',
      techStack: ['Stripe API', 'Figma', 'Jira'],
      metrics: { 'Billing Leakage': '-18%' },
      notionUrl: 'https://pine-porter-01d.notion.site/Coworking-Space-SaaS-Booking-Platform-3aae67c1bc3b80e1a009f17b7bb28491'
    }
  ],"""

pattern = r"  projects: \[.*?\n  \],"
updated_content = re.sub(pattern, new_projects, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(updated_content)

print('Updated data.js projects')
