from django.shortcuts import render, redirect
from django.forms.models import model_to_dict
from django.http import JsonResponse, HttpResponse
from django.core.handlers.wsgi import WSGIRequest
from .models import orientadores, clientes, chamadas, agendamentos
from json import loads
from datetime import datetime, timedelta
from time import strftime, strptime
from argon2 import PasswordHasher

#Funções

def update_calls(request: WSGIRequest):
    if request.method == "GET": #Retorna ligações da data atual
        Data = [_Orientador for _Orientador in chamadas.objects.filter(data = strftime("%Y-%m-%d")).order_by('horario')] 
        _Orientadores: dict[str, list] = {}
        for _Orientador in Data:
            if _Orientador.orientador.Nome not in _Orientadores.keys():
                _Orientadores[_Orientador.orientador.Nome] = []
                _Orientadores[_Orientador.orientador.Nome].append({_Orientador.horario.strftime("%H:%M"): {"chamadas": _Orientador.chamadas, "Atendidas": _Orientador.atendidas}})
            else:
                _Orientadores[_Orientador.orientador.Nome].append({_Orientador.horario.strftime("%H:%M"): {"chamadas": _Orientador.chamadas, "Atendidas": _Orientador.atendidas}})
                
        print(_Orientadores)
                            
    else: #Retorna as ligações de uma data especifica
        ...

    return JsonResponse(_Orientadores)

def Logout(request: WSGIRequest):
    if "ID" in request.session.keys():
        del request.session["ID"]
    return redirect('Login')

def edit_cliente(request: WSGIRequest):
    Data: dict = loads(request.body.decode())
    Cliente = clientes.objects.get(ID = Data['ID'])
    Cliente.nome = Data['nome']
    Cliente.celular = Data['celular']
    Cliente.acompanhante = Data['acompanhante']
    Cliente.curso = Data['curso']
    Cliente.data_agendada = datetime.strptime(Data['data_agendada'], '%d/%m/%Y %H:%M')
    Cliente.orientador = orientadores.objects.get(Nome = Data['orientador'])
    Cliente.observacoes = Data['observacoes']
    Cliente.presenca = Data['presenca']
    Cliente.status = Data['status']
    Cliente.save()
    return HttpResponse(200)
    

def add_cliente(request: WSGIRequest):
    Data: dict = loads(request.body.decode())
    print(agendamentos.objects.all())
    if len(agendamento := agendamentos.objects.get(data_agendada = strftime("%Y-%m-%d"))) > 0:
        agendamento.agendamentos += 1
    else:
        agendamentos(agendamentos = 1, data = strftime("%Y-%m-%d")).save()
    clientes(
        nome = Data['Nome'],
        orientador = orientadores.objects.get(ID = Data['Orientador']),
        acompanhante = Data['Acompanhante'],
        curso = Data['Curso'],
        celular = Data['Celular'],
        data_agendada = datetime.strptime(Data['Data'], '%d/%m/%Y %H:%M'),
        observacoes = Data['Observacoes']
    ).save()
    return HttpResponse(200)
    

def DeleteCostumer(request: WSGIRequest):
    Data: dict = loads(request.body.decode())
    try:
        clientes.objects.get(ID = Data['ID']).delete()
        return HttpResponse(200)
    except:
        return HttpResponse(404)


def GetOrientadores(request: WSGIRequest):
    if request.method == "POST":
        Data: dict = loads(request.body.decode())    
        return JsonResponse(model_to_dict(orientadores.objects.get(ID = int(Data['ID']))))
    _ = {model_to_dict(Orientador)['ID']: model_to_dict(Orientador) for Orientador in orientadores.objects.all()}
    for i in _:
        del _[i]['Senha']
    print(_)
    return JsonResponse(_)

def GetAgendamentos(request: WSGIRequest):
    Dados: dict[str, str] = loads(request.body.decode())
    
    if Dados['Inicio'] != '' and Dados['Final'] != '':
        Inicio, Final = datetime.strptime(Dados['Inicio'], '%Y-%m-%d'), datetime.strptime(Dados['Final'], '%Y-%m-%d') + timedelta(days=1, seconds=-1)
    else:
        Inicio, Final = datetime.now(), datetime.now()

    Agendamentos = {i: model_to_dict(Cliente) for i, Cliente in enumerate(clientes.objects.order_by('data_agendada').filter(data_agendada__range=[Inicio, Final]))}

    Datas = []
    while Inicio <= Final:

        Datas.append(Inicio.date())
        Inicio += timedelta(days=1)

    return JsonResponse({'Datas': Datas, 'Agendamentos': Agendamentos})

#Páginas 
def Login(request: WSGIRequest):
    # orientadores(Nome = "Gustavo", Senha = PasswordHasher().hash("123"), Cor = "0000ff").save()
    # orientadores(Nome = "Josine", Senha = PasswordHasher().hash("123"), Cor = "f542ec").save()
    if request.method == "POST":
        Dados: dict[str, str] = loads(request.body.decode())
        for Orientador in list(orientadores.objects.filter(Nome = Dados['Usuario'])):
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
        Orientador = orientadores.objects.all()
        return render(request, 
            'Agendamentos.html', {
                'Orientadores': Orientador, 
                "Usuario": orientadores.objects.get(ID = request.session["ID"])
                })
    return redirect('Login')