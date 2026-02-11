
import React, { useEffect, useState } from 'react';
import Api from '../../Services/Api';
import './SiteStats.css';
import { useTranslation } from 'react-i18next';

const SiteStats = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({ daily: [], monthly: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await Api.get('/user/site-stats');
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch site stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="loading-stats">{t('loading') || 'Loading...'}</div>;

    return (
        <div className="site-stats-container">
            <h2>{t('site_visits_stats') || 'Site Visits Statistics'}</h2>
            
            <div className="stats-tables-wrapper">
                {/* Daily Stats (Right) */}
                <div className="stats-section daily-section">
                    <h3>{t('daily_visits') || 'Daily Visits'}</h3>
                    <table className="stats-table">
                        <thead>
                            <tr>
                                <th>{t('date') || 'Date'}</th>
                                <th>{t('visits') || 'Visits'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.daily.map((day, index) => (
                                <tr key={index}>
                                    <td>{day.date}</td>
                                    <td>{day.total_visits}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Monthly Stats (Left) */}
                <div className="stats-section monthly-section">
                    <h3>{t('monthly_visits') || 'Monthly Visits'}</h3>
                    <table className="stats-table">
                        <thead>
                            <tr>
                                <th>{t('month') || 'Month'}</th>
                                <th>{t('visits') || 'Visits'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.monthly.map((month, index) => (
                                <tr key={index}>
                                    <td>{month.month}</td>
                                    <td>{month.total_visits}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SiteStats;
