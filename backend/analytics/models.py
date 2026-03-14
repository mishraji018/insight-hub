from django.db import models

class SalesData(models.Model):
    date = models.DateField()
    product_id = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    sales_amount = models.DecimalField(max_digits=12, decimal_places=2)
    customers = models.IntegerField()
    marketing_spend = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Sales Data"
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['region']),
            models.Index(fields=['product_id']),
        ]

    def __str__(self):
        return f"{self.date} - {self.product_id} ({self.region})"

class Prediction(models.Model):
    TREND_CHOICES = (
        ('increasing', 'Increasing'),
        ('decreasing', 'Decreasing'),
        ('stable', 'Stable'),
    )
    date = models.DateField()
    predicted_sales = models.DecimalField(max_digits=12, decimal_places=2)
    confidence_score = models.FloatField()
    model_version = models.CharField(max_length=50)
    trend = models.CharField(max_length=20, choices=TREND_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['model_version']),
        ]

    def __str__(self):
        return f"Prediction for {self.date} (v{self.model_version})"

class MLModel(models.Model):
    version = models.CharField(max_length=50, unique=True)
    algorithm = models.CharField(max_length=100)
    trained_at = models.DateTimeField()
    accuracy_score = models.FloatField()
    is_active = models.BooleanField(default=False)
    file_path = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.algorithm} - v{self.version} ({'Active' if self.is_active else 'Inactive'})"

class Anomaly(models.Model):
    date = models.DateField()
    product_id = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    sales_amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], default='medium')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Anomalies"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['severity']),
            models.Index(fields=['region']),
        ]

    def __str__(self):
        return f"Anomaly on {self.date} - {self.product_id} ({self.severity})"
