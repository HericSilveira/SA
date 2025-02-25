from django.contrib import admin
from .models import orientadores, clientes

@admin.register(orientadores)
class OrientadoresAdmin(admin.ModelAdmin):
    list_display = ['ID', 'Nome', 'Senha', 'Cor']

@admin.register(clientes)
class ClientesAdmin(admin.ModelAdmin):
    list_display = ['ID', 'nome', 'orientador', 'acompanhante', 'curso', 'celular', 'data_agendada', 'data_registrado', 'status', 'observacoes']