# Generated by Django 5.1.5 on 2025-02-24 16:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Sistema_de_Agendamento', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='chamadas',
            name='horario',
            field=models.TimeField(null=True),
        ),
        migrations.AlterField(
            model_name='chamadas',
            name='data',
            field=models.DateField(auto_now=True),
        ),
    ]
