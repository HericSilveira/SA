from django.shortcuts import render, redirect
from django.forms.models import model_to_dict
from django.http import JsonResponse, HttpResponse
from django.core.handlers.wsgi import WSGIRequest
from .models import Orientadores, Clientes
from json import loads
from datetime import datetime, timedelta
from time import strftime
from argon2 import PasswordHasher
import sqlite3

#Funções

def update_calls(request: WSGIRequest):
    with sqlite3.connect('calls.db') as conn:
        Cursor = conn.cursor()
        Calls = Cursor.execute("SELECT * FROM total_calls").fetchall() # WHERE data = ?", (strftime('%d/%m/%Y'), )
        Chamadas = {Orientador[1]: [] for Orientador in Calls}
        for Call in Calls:
            print(Call)
            if Call[1] in Chamadas:
                Chamadas[Call[1]].append({'Chamadas': Call[2], 'Atendidas': Call[3], 'Horario' : Call[5]})

        return JsonResponse(Chamadas)

def Logout(request: WSGIRequest):
    if "ID" in request.session.keys():
        del request.session["ID"]
    return redirect('Login')

def edit_cliente(request: WSGIRequest):
    Data: dict = loads(request.body.decode())
    Cliente = Clientes.objects.get(ID = Data['ID'])
    Cliente.Nome = Data['Nome']
    Cliente.Celular = Data['Celular']
    Cliente.Acompanhante = Data['Acompanhante']
    Cliente.Curso = Data['Curso']
    Cliente.Data = datetime.strptime(Data['Data'], '%d/%m/%Y %H:%M')
    Cliente.Orientador = Orientadores.objects.get(Nome = Data['Orientador'])
    Cliente.Observacoes = Data['Observacoes']
    Cliente.Presenca = Data['Presenca']
    Cliente.Status = Data['Status']
    Cliente.save()
    return HttpResponse(200)
    

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
    

def DeleteCostumer(request: WSGIRequest):
    Data: dict = loads(request.body.decode())
    try:
        Clientes.objects.get(ID = Data['ID']).delete()
        return HttpResponse(200)
    except:
        return HttpResponse(404)


def GetOrientadores(request: WSGIRequest):
    if request.method == "POST":
        Data: dict = loads(request.body.decode())    
        return JsonResponse(model_to_dict(Orientadores.objects.get(ID = int(Data['ID']))))
    _ = {model_to_dict(Orientador)['ID']: model_to_dict(Orientador) for Orientador in Orientadores.objects.all()}
    for i in _:
        del _[i]['Senha']
    return JsonResponse(_)

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

    return JsonResponse({'Datas': Datas, 'Agendamentos': Agendamentos})

#Páginas 
def Login(request: WSGIRequest):
    # Orientadores(Nome = "Gustavo", Senha = PasswordHasher().hash("123"), Cor = "f542ec").save()
    # Orientadores(Nome = "Josine", Senha = PasswordHasher().hash("123"), Cor = "0000ff").save()
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
        return render(request, 
            'Agendamentos.html', {
                'Orientadores': Orientador, 
                "Usuario": Orientadores.objects.get(ID = request.session["ID"])
                })
    return redirect('Login')