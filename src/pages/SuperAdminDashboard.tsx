const fetchDashboardStats = async () => {
  try {
    const response = await companiesAPI.getAll({ limit: 5 });
    if (response.data.success) {
      const companies = response.data.data.companies;
      setStats({
        totalCompanies: response.data.data.pagination.total,
        activeCompanies: companies.filter((c: any) => c.status === 'Active').length,
        totalUsers: companies.reduce((sum: number, c: any) => sum + (c.userCount || 0), 0),
        recentCompanies: companies.slice(0, 5),
      });
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
  } finally {
    setLoading(false);
  }
};