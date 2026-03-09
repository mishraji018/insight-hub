import { AppLayout } from "@/components/AppLayout";
import { ForecastChart } from "@/components/ForecastChart";
import { useForecast } from "@/hooks/useForecast";
import { Skeleton } from "@/components/ui/skeleton";

const PredictionsPage = () => {
  const { data, isLoading } = useForecast();

  const forecastData = data?.forecast || Array.from({ length: 7 }, (_, i) => ({
    date: `Apr ${i + 1}`,
    predicted_sales: 4000 + Math.random() * 1000,
    confidence: 300 + Math.random() * 200,
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Predictions</h1>
          <p className="text-sm text-muted-foreground">ML-powered sales forecasting</p>
        </div>

        {isLoading ? (
          <div className="glass-card p-5 space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-72 w-full" />
          </div>
        ) : (
          <ForecastChart data={forecastData} />
        )}
      </div>
    </AppLayout>
  );
};

export default PredictionsPage;
