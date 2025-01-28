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
    return JsonResponse({model_to_dict(Orientador)['ID']: model_to_dict(Orientador) for Orientador in Orientadores.objects.all()})

def GetAgendamentos(request: WSGIRequest):
    Data = loads(request.body.decode())
    Inicio = datetime.strptime(Data['Inicio'], '%Y-%m-%d')
    Final = datetime.strptime(Data['Final'], '%Y-%m-%d') + (timedelta(days=1) - timedelta(seconds=1)) # conta feita para pegar todos os contatos até as 23:59:59 da Data Final
    Models = Clientes.objects.filter(Data__range=[make_aware(Inicio), make_aware(Final)]).order_by('Data')
    Models = {i: model_to_dict(Model) for i, Model in enumerate(Models)}

    for model in Models:
        print()
        print(Models[model])
        print()

    return JsonResponse(Models)

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