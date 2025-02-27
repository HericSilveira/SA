"""
URL configuration for SA project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from Sistema_de_Agendamento.views import Login, Logout, Agendamentos
from Sistema_de_Agendamento.views import GetOrientadores, GetAgendamentos, DeleteCostumer, add_cliente, edit_cliente, update_calls

urlpatterns = [
    #Páginas
    path('admin/', admin.site.urls),
    path('', Login, name='Login'),
    path('Login/', Login, name='Login'),
    path('Agendamentos/', Agendamentos, name='Agendamentos'),
    #Funções
    path('Agendamentos/Logout', Logout, name='Logout'),
    path('Agendamentos/GetOrientadores', GetOrientadores, name='GetOrientadores'),
    path('Agendamentos/GetAgendamentos', GetAgendamentos, name='GetAgendamentos'),
    path('Agendamentos/DeleteCostumer', DeleteCostumer, name='DeleteCostumer'),
    path('Agendamentos/AddCliente', add_cliente, name='AddCliente'),
    path('Agendamentos/edit_cliente', edit_cliente, name='edit_cliente'),
    path('Agendamentos/update_calls', update_calls, name='update_calls')
]
