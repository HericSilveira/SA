# Generated by Django 5.1.4 on 2025-01-28 14:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Sistema_de_Agendamento', '0005_clientes_presenca_alter_clientes_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='clientes',
            name='Presenca',
            field=models.CharField(choices=[('0', 'Ausente'), ('1', 'Presente'), ('2', '')], default='0', max_length=1),
        ),
        migrations.AlterField(
            model_name='clientes',
            name='Status',
            field=models.CharField(choices=[('0', 'Recusou'), ('1', 'Comprou'), ('2', 'Negociando'), ('3', '')], default='2', max_length=1),
        ),
    ]
