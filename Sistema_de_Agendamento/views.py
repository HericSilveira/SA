from django.shortcuts import render, redirect
from django.forms.models import model_to_dict
from django.http import JsonResponse
from django.core.handlers.wsgi import WSGIRequest
from django.utils.timezone import make_aware
from .models import Orientadores, Clientes
from json import dumps, loads
from datetime import datetime, timedelta
from argon2 import PasswordHasher

#Funções

def Logout(request: WSGIRequest):
    if "ID" in request.session.keys():
        del request.session["ID"]
    return redirect('Login')

def GetOrientadores(request: WSGIRequest):
    Data: dict = loads(request.body.decode())
    if 'ID' in Data.keys():
        return JsonResponse({model_to_dict(Orientadores.objects.get(ID = Data['ID']))})
    return JsonResponse({model_to_dict(Orientador)['ID']: model_to_dict(Orientador) for Orientador in Orientadores.objects.all()})

def GetAgendamentos(request: WSGIRequest):
    Dados: dict[str, str] = loads(request.body.decode())

    
    
    Inicio, Final = datetime.strptime(Dados['Inicio'], '%Y-%m-%d'), datetime.strptime(Dados['Final'], '%Y-%m-%d') + timedelta(days=1, seconds=-1)

    print(Inicio, Final)
    Agendamentos = {i: model_to_dict(Cliente) for i, Cliente in enumerate(Clientes.objects.order_by('Data').filter(Data__range=[Inicio, Final]))}

    Datas = []
    while Inicio <= Final:

        Datas.append(Inicio.date())
        Inicio += timedelta(days=1)

    print(len(Agendamentos))
    return JsonResponse({'Datas': Datas, 'Agendamentos': Agendamentos})

#Páginas 
def Login(request: WSGIRequest):
    if request.method == "POST":
        Dados: dict[str, str] = loads(request.body.decode())
        for Orientador in list(Orientadores.objects.filter(Nome = Dados['Usuario'])):
            try:
                if PasswordHasher().verify(Orientador.Senha, Dados["Senha"].encode()):
                    request.session['ID'] = Orientador.ID
                    return JsonResponse({"Status": "Success"})  
            except:
                return JsonResponse({'Status': 'Fail'})

    elif "ID" not in request.session.keys():
        return render(request, 'Login.html')      
    else:
        return redirect('Agendamentos')

                
def Agendamentos(request: WSGIRequest):
    if "ID" in request.session:
        Usuario = Orientadores.objects.get(ID=request.session['ID']).Nome
        return render(request, 'Agendamentos.html', {'Usuario': Usuario})
    return redirect('Login')