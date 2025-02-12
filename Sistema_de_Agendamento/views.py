from django.shortcuts import render, redirect
from django.forms.models import model_to_dict
from django.http import JsonResponse, HttpResponse
from django.core.handlers.wsgi import WSGIRequest
from .models import Orientadores, Clientes
from json import  loads
from datetime import datetime, timedelta
from argon2 import PasswordHasher

#Funções

def Logout(request: WSGIRequest):
    if "ID" in request.session.keys():
        del request.session["ID"]
    return redirect('Login')

def add_cliente(request: WSGIRequest):
    Data: dict = loads(request.body.decode())
    Clientes(
        Nome = Data['Nome'],
        Orientador = Orientadores.objects.get(ID = Data['Orientador']),
        Acompanhante = Data['Acompanhante'],
        Curso = Data['Curso'],
        Celular = Data['Celular'],
        Data = datetime.strptime(Data['Data'], '%d/%m/%Y %H:%M'),
        Observacoes = Data['Observacoes']
    ).save()
    return HttpResponse(200)
    ...

def DeleteCostumer(request: WSGIRequest):
    Data: dict = loads(request.body.decode())
    try:
        Clientes.objects.get(ID = Data['ID']).delete()
        return HttpResponse(200)
    except:
        return HttpResponse(404)


def GetOrientadores(request: WSGIRequest):
    Data: dict = loads(request.body.decode())
    print(Data)
    if 'ID' in Data.keys():
        print(int(Data['ID']))
        return JsonResponse(model_to_dict(Orientadores.objects.get(ID = int(Data['ID']))))
    return JsonResponse({model_to_dict(Orientador)['ID']: model_to_dict(Orientador) for Orientador in Orientadores.objects.all()})

def GetAgendamentos(request: WSGIRequest):
    Dados: dict[str, str] = loads(request.body.decode())
    
    if Dados['Inicio'] != '' and Dados['Final'] != '':
        Inicio, Final = datetime.strptime(Dados['Inicio'], '%Y-%m-%d'), datetime.strptime(Dados['Final'], '%Y-%m-%d') + timedelta(days=1, seconds=-1)
    else:
        Inicio, Final = datetime.now(), datetime.now()

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
        Orientador = Orientadores.objects.all()
        return render(request, 'Agendamentos.html', {'Orientadores': Orientador})
    return redirect('Login')