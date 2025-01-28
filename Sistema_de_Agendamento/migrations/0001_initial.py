# Generated by Django 5.1.4 on 2025-01-23 13:05

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Clientes',
            fields=[
                ('ID', models.AutoField(primary_key=True, serialize=False)),
                ('Nome', models.CharField(max_length=255)),
                ('Orientador', models.CharField(max_length=255)),
                ('Acompanhante', models.CharField(max_length=255)),
                ('Curso', models.CharField(max_length=255)),
                ('Celular', models.PositiveSmallIntegerField()),
                ('Data', models.DateTimeField()),
                ('Status', models.CharField(choices=[], max_length=2)),
                ('Observacoes', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Orientadores',
            fields=[
                ('ID', models.AutoField(primary_key=True, serialize=False)),
                ('Nome', models.CharField(max_length=255)),
                ('Senha', models.CharField(max_length=255)),
                ('Cor', models.CharField(max_length=6)),
            ],
        ),
    ]
