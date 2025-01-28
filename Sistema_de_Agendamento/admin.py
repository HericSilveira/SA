from django.contrib import admin
from .models import Orientadores, Clientes

@admin.register(Orientadores)
class OrientadoresAdmin(admin.ModelAdmin):
    list_display = ['ID', 'Nome', 'Senha', 'Cor']

@admin.register(Clientes)
class ClientesAdmin(admin.ModelAdmin):
    list_display = ['ID', 'Nome', 'Orientador', 'Acompanhante', 'Curso', 'Celular', 'Data', 'Status', 'Observacoes']