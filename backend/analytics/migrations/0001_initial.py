from django.db import migrations, models

class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MLModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('version', models.CharField(max_length=50, unique=True)),
                ('algorithm', models.CharField(max_length=100)),
                ('trained_at', models.DateTimeField()),
                ('accuracy_score', models.FloatField()),
                ('is_active', models.BooleanField(default=False)),
                ('file_path', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Prediction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('predicted_sales', models.DecimalField(decimal_digits=2, max_digits=12)),
                ('confidence_score', models.FloatField()),
                ('model_version', models.CharField(max_length=50)),
                ('trend', models.CharField(choices=[('increasing', 'Increasing'), ('decreasing', 'Decreasing'), ('stable', 'Stable')], max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-date'],
            },
        ),
        migrations.CreateModel(
            name='SalesData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('product_id', models.CharField(max_length=100)),
                ('region', models.CharField(max_length=100)),
                ('sales_amount', models.DecimalField(decimal_digits=2, max_digits=12)),
                ('customers', models.IntegerField()),
                ('marketing_spend', models.DecimalField(decimal_digits=2, max_digits=12)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name_plural': 'Sales Data',
                'ordering': ['-date'],
            },
        ),
    ]
