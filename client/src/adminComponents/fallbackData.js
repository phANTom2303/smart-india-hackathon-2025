// Centralized fallback and sample data for admin components

// AdminOverview fallbacks
export const adminFallbackProjectsData = [
  { id: 1, projectId: 'NCCR-2024-001', projectName: 'Clean Water Initiative', ngoName: 'Water for All Foundation' },
  { id: 2, projectId: 'NCCR-2024-002', projectName: 'Education Support Program', ngoName: 'Learning Together NGO' },
  { id: 3, projectId: 'NCCR-2024-003', projectName: 'Healthcare Outreach', ngoName: 'Medical Aid Society' },
  { id: 4, projectId: 'NCCR-2024-004', projectName: 'Rural Development Project', ngoName: 'Village Progress Organization' },
  { id: 5, projectId: 'NCCR-2024-005', projectName: 'Women Empowerment Initiative', ngoName: 'Empowered Women Foundation' }
];

export const adminFallbackReportsData = [
  { id: 1, reportName: 'Q4 2024 Impact Report', projectName: 'Clean Water Initiative', co2Offset: '250 tons', status: 'verified' },
  { id: 2, reportName: 'Annual Sustainability Report 2024', projectName: 'Education Support Program', co2Offset: '120 tons', status: 'submitted' },
  { id: 3, reportName: 'Monthly Progress Report - Dec', projectName: 'Healthcare Outreach', co2Offset: '85 tons', status: 'draft' },
  { id: 4, reportName: 'Environmental Impact Assessment', projectName: 'Rural Development Project', co2Offset: '340 tons', status: 'rejected' },
  { id: 5, reportName: 'Carbon Footprint Analysis', projectName: 'Women Empowerment Initiative', co2Offset: '180 tons', status: 'verified' },
  { id: 6, reportName: 'Quarterly Emissions Report', projectName: 'Clean Water Initiative', co2Offset: '95 tons', status: 'submitted' }
];

// ProjectOverview hardcoded sample
export const projectOverviewFallbackRecords = [
  {
    id: 1,
    timestamp: '2024-03-15 14:30:00',
    evidence: 'tree_planting_site1.jpg',
    evidenceType: 'Before Planting',
    status: 'PENDING',
    dataPayload: {
      speciesPlanted: 'Oak, Maple, Pine',
      numberOfTrees: 25,
      notes: 'Initial planting phase completed successfully. Soil preparation done.'
    }
  },
  {
    id: 2,
    timestamp: '2024-03-12 11:20:00',
    evidence: 'progress_site2.jpg',
    evidenceType: 'Progress Update',
    status: 'PROCESSED',
    dataPayload: {
      speciesPlanted: 'Mangrove Trees',
      numberOfTrees: 45,
      notes: 'Mangrove saplings planted in designated coastal area. Good survival rate expected.'
    }
  },
  {
    id: 3,
    timestamp: '2024-03-10 16:45:00',
    evidence: 'soil_preparation.jpg',
    evidenceType: 'Site Preparation',
    status: 'PENDING',
    dataPayload: {
      speciesPlanted: 'Mangrove Seedlings',
      numberOfTrees: 30,
      notes: 'Coastal area cleared and prepared for mangrove plantation. Tidal patterns studied.'
    }
  },
  {
    id: 4,
    timestamp: '2024-03-08 09:30:00',
    evidence: 'baseline_survey.jpg',
    evidenceType: 'Baseline Survey',
    status: 'PROCESSED',
    dataPayload: {
      speciesPlanted: 'N/A',
      numberOfTrees: 0,
      notes: 'Initial survey completed. Identified optimal locations for mangrove restoration.'
    }
  }
];

export const projectOverviewCurrentProject = {
  id: 'DC003',
  projectId: 'PRJ003',
  name: 'Sundarban Mangrove Restoration Project',
  submittedBy: 'Field Agent Mike Wilson',
  timestamp: '2024-09-15T10:30:00'
};

// ReportAction fallbacks
export const reportActionFallbackReportData = {
  id: 'RPT001',
  reportName: 'Q4 2024 Impact Report',
  projectName: 'Clean Water Initiative',
  timeperiod: 'October - December 2024',
  totalCO2Offset: '250',
  reportNotes:
    "This comprehensive report details the Clean Water Initiative's environmental impact during Q4 2024. The project successfully implemented multiple water conservation and treatment systems across Maharashtra, resulting in significant carbon footprint reduction through decreased energy consumption and improved water efficiency.",
  status: 'Submitted',
  submittedDate: '2024-12-30',
  submittedBy: 'Project Manager - Rahul Sharma',
  lastModified: '2024-12-29 14:30'
};

export const reportActionFallbackMonitoringRecords = [
  {
    id: 'MR001',
    date: '2024-10-15',
    activity: 'Water filtration system installation',
    location: 'Site A - Mumbai',
    co2Reduction: '45',
    status: 'Verified',
    details:
      'Installed 5 high-efficiency water filtration units serving 1,200 households. Reduced transportation emissions from bottled water delivery and energy consumption from conventional treatment methods.',
    verificationDate: '2024-10-16',
    verifiedBy: 'Environmental Auditor - Dr. Priya Mehta'
  },
  {
    id: 'MR002',
    date: '2024-11-05',
    activity: 'Solar-powered pumping stations',
    location: 'Site B - Pune',
    co2Reduction: '78',
    status: 'Verified',
    details:
      'Commissioned 3 solar-powered water pumping stations with 75kW total capacity. Eliminated grid electricity dependency and reduced carbon emissions from fossil fuel-based power generation.',
    verificationDate: '2024-11-06',
    verifiedBy: 'Environmental Auditor - Dr. Amit Patel'
  },
  {
    id: 'MR003',
    date: '2024-11-20',
    activity: 'Rainwater harvesting network',
    location: 'Site C - Nashik',
    co2Reduction: '52',
    status: 'Verified',
    details:
      'Established comprehensive rainwater harvesting network covering 15 residential complexes. Reduced groundwater extraction and associated pumping energy requirements.',
    verificationDate: '2024-11-21',
    verifiedBy: 'Environmental Auditor - Dr. Sunita Joshi'
  },
  {
    id: 'MR004',
    date: '2024-12-10',
    activity: 'Greywater treatment facility',
    location: 'Site D - Aurangabad',
    co2Reduction: '63',
    status: 'Verified',
    details:
      'Constructed advanced greywater treatment facility processing 25,000 liters daily. Reduced fresh water demand and treatment energy consumption through water recycling.',
    verificationDate: '2024-12-11',
    verifiedBy: 'Environmental Auditor - Dr. Vikram Singh'
  },
  {
    id: 'MR005',
    date: '2024-12-20',
    activity: 'Community water conservation program',
    location: 'Multiple sites - Maharashtra',
    co2Reduction: '12',
    status: 'Verified',
    details:
      'Conducted extensive community education and water conservation awareness programs reaching 5,000+ residents. Behavioral changes resulted in 20% reduction in water consumption and associated energy use.',
    verificationDate: '2024-12-21',
    verifiedBy: 'Environmental Auditor - Dr. Kavita Desai'
  }
];

// ReportEdit fallbacks
export const reportEditFallbackReportData = {
  reportName: 'Monthly Progress Report - December 2024',
  projectName: 'Clean Water Initiative',
  timeperiod: 'December 1-31, 2024',
  totalCO2Offset: '85',
  reportNotes:
    'This report covers the clean water project activities for December 2024. The project has shown significant progress in reducing carbon emissions through improved water filtration systems.'
};

export const reportEditFallbackMonitoringRecords = [
  {
    id: 'MR001',
    date: '2024-12-05',
    activity: 'Water filtration system installation',
    location: 'Site A - Mumbai',
    co2Reduction: '15 tonnes',
    status: 'Verified',
    details:
      'Installed 3 new high-efficiency water filtration units. Estimated CO2 reduction from reduced transportation of bottled water and energy-efficient filtration process.',
    verificationDate: '2024-12-06',
    verifiedBy: 'Environmental Auditor - John Smith'
  },
  {
    id: 'MR002',
    date: '2024-12-12',
    activity: 'Solar panel installation for pumping stations',
    location: 'Site B - Pune',
    co2Reduction: '25 tonnes',
    status: 'Verified',
    details:
      'Completed installation of 50kW solar panel system for water pumping stations. This eliminates dependency on grid electricity and reduces carbon footprint significantly.',
    verificationDate: '2024-12-13',
    verifiedBy: 'Environmental Auditor - Sarah Johnson'
  },
  {
    id: 'MR003',
    date: '2024-12-18',
    activity: 'Rainwater harvesting system setup',
    location: 'Site C - Nashik',
    co2Reduction: '20 tonnes',
    status: 'Verified',
    details:
      'Implemented comprehensive rainwater harvesting system serving 500 households. Reduces groundwater extraction and associated pumping energy consumption.',
    verificationDate: '2024-12-19',
    verifiedBy: 'Environmental Auditor - Mike Chen'
  },
  {
    id: 'MR004',
    date: '2024-12-22',
    activity: 'Greywater recycling plant installation',
    location: 'Site D - Aurangabad',
    co2Reduction: '18 tonnes',
    status: 'Verified',
    details:
      'Set up greywater recycling plant processing 10,000 liters daily. Reduces fresh water demand and treatment energy requirements.',
    verificationDate: '2024-12-23',
    verifiedBy: 'Environmental Auditor - Lisa Wang'
  },
  {
    id: 'MR005',
    date: '2024-12-28',
    activity: 'Community education program on water conservation',
    location: 'Multiple sites - Maharashtra',
    co2Reduction: '7 tonnes',
    status: 'Verified',
    details:
      'Conducted water conservation awareness programs for 2000+ residents. Behavioral changes estimated to reduce water consumption by 15% and associated energy use.',
    verificationDate: '2024-12-29',
    verifiedBy: 'Environmental Auditor - David Kumar'
  }
];
