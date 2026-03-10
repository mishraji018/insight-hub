import { http, HttpResponse } from 'msw';

export const handlers = [
    http.get('*/api/analytics-summary/', () => {
        return HttpResponse.json({
            "total_revenue": 842000,
            "predicted_growth": 15.4,
            "top_product": "Product A",
            "top_region": "North",
            "avg_daily_sales": 28066
        });
    }),

    http.get('*/api/forecast-week/', () => {
        const today = new Date();
        const forecast = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            return {
                date: date.toISOString().split('T')[0],
                predicted_sales: 120000 + Math.random() * 20000,
                confidence: 0.8 + Math.random() * 0.15
            };
        });
        return HttpResponse.json(forecast);
    }),

    http.post('*/api/predict-sales/', () => {
        return HttpResponse.json({
            "next_week_sales": 128000,
            "confidence": 0.87,
            "trend": "increasing"
        });
    }),

    http.get('*/api/predictions/', () => {
        const today = new Date();
        const history = Array.from({ length: 10 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            return {
                id: i + 1,
                date: date.toISOString().split('T')[0],
                predicted_sales: 110000 + Math.random() * 30000,
                confidence_score: 0.75 + Math.random() * 0.2,
                trend: i % 3 === 0 ? 'increasing' : 'stable',
                model_version: 'v1.0.4'
            };
        });
        return HttpResponse.json(history);
    }),

    http.post('*/api/token/', () => {
        return HttpResponse.json({
            access: 'fake-access-token',
            refresh: 'fake-refresh-token',
            user: {
                email: 'admin@insight-hub.com',
                role: 'executive'
            }
        });
    }),

    http.get('*/api/models/', () => {
        return HttpResponse.json([
            { id: 1, version: 'v1.0.4', algorithm: 'random_forest', trained_at: '2025-01-01', accuracy_score: 0.92, is_active: true },
            { id: 2, version: 'v1.0.3', algorithm: 'xgboost', trained_at: '2024-12-15', accuracy_score: 0.89, is_active: false }
        ]);
    }),

    http.get('*/api/sales-data/', () => {
        return HttpResponse.json({
            count: 100,
            next: null,
            previous: null,
            results: Array.from({ length: 10 }, (_, i) => ({
                id: i,
                date: '2024-12-' + (i + 1),
                product_id: 'PRD-00' + i,
                region: i % 2 === 0 ? 'North' : 'South',
                sales_amount: 5000 + i * 100,
                customers: 50 + i,
                marketing_spend: 200 + i * 10
            }))
        });
    })
];
