const TOKEN = document.getElementById('TOKEN').content;
let WindowEventsAdded = false;


document.addEventListener('DOMContentLoaded', async () => {
    flatpickr('#Data', {'dateFormat': 'd/m/Y','mode': 'range','locale': 'pt'});
    flatpickr('#DataAgendamento', {'dateFormat': 'd/m/Y H:i','locale': 'pt', 'enableTime': true, 'time_24hr': true});
    
    
    total_calls();
    Logout();
    LoadAgendamentos();
    InformationPanel();
    Remove();
    adicionar_agendamento();
})

async function total_calls() {
    let Dashboard = document.querySelector('#Dashboard')

    let DashboardButton = document.querySelector('#Navbar > li > a')

    DashboardButton.addEventListener('click', () => {
        Dashboard.style.visibility = 'visible'
        Dashboard.style.opacity = 1
    })

    Dashboard.querySelector('img').addEventListener('click', () => {
        Dashboard.style.visibility = 'hidden'
        Dashboard.style.opacity = 0.0
    })

    let Dados = await calls_update()
    let Container = document.querySelector('#Dashboard > ul')


    for (const KEY in Dados){
        let GraficoContainer = document.createElement('li')
        let Grafico = document.createElement('canvas')

        GraficoContainer.appendChild(Grafico)

        Container.appendChild(GraficoContainer)


        let Infos = () => {
            let Horarios = [];
            let Chamadas = [];
            let Atendidas = [];
            for (let Index = 0; Index < Dados[KEY].length; Index++) {
                Horarios.push(Dados[KEY][Index]["Horario"])
                Chamadas.push(Dados[KEY][Index]["Chamadas"])
                Atendidas.push(Dados[KEY][Index]["Atendidas"])
            };

            return [Horarios, Chamadas, Atendidas];
        }
        const Configuration = {
            type: 'line',
            showTooltips: true,
            data: {
                labels: [...Infos()[0]],
                datasets: [{
                    label: 'Ligações Chamadas',
                    data: [...Infos()[1]]
                },
                {
                    label: 'Ligações Atendidas',
                    data: [...Infos()[2]]
                }
            ]
            },
            options: {
                responsive: true,
                mantainAspectRatio: false,
                width: 400,
                height: 300,
                plugins: {
                title: {
                    display: true,
                    text: KEY
                }},
                scales: {
                    y: {
                        beginAtZero: true,
                        max: Infos()[1].at(-1) * 2 > 0 ? Infos()[1].at(-1) * 2 : 20,
                        ticks: {
                            stepSize: Infos()[1].at(-1) * 2 > 0 ? Math.floor(Infos()[1].at(-1) * 2 * 0.1) : 20 * 0.1
                        }
                    }
                }
            }
            

        }
        let X = new Chart(Grafico, Configuration)
        X.update()
        console.log(X)
    }
}

async function calls_update() {
    response = await fetch('update_calls')
    dados = await response.json()
    return dados
}

function FormatarData(Data) {
    let Horario = Data.split('T')[1]
    Data = Data.split('T')[0].split('-').reverse()
    Data[0] = Number(Data[0])
    Data[1] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][Number(Data[1])]
    return Data.join(' de ') + ` as ${Horario.slice(0, 5)}`
}

function Logout() {
    let ID = document.getElementById('Logout')
    ID.addEventListener('click', () => {
        fetch('Logout')
        window.location.href = ''
    })
}

async function DeleteCostumer(ID) {
    response = await fetch('DeleteCostumer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': TOKEN
        },
        body: JSON.stringify({'ID': ID})
    })
    let Data = await response.json()
    return Data
}

async function adicionar_agendamento() {

    let RegistrarContainer = document.getElementById('RegistrarContainer')

    document.querySelector('#AgendamentosFooter li:first-child').addEventListener('click', () => {
        if (RegistrarContainer.style.visibility == 'hidden' || RegistrarContainer.style.visibility == ''){
            RegistrarContainer.style.visibility = 'visible';
            RegistrarContainer.style.opacity = 1;
        }
        else{
            RegistrarContainer.style.visibility = 'hidden';
        }
    })
    document.querySelector('#RegistrarContainer > header > img').addEventListener('click', () => {
        RegistrarContainer.style.visibility = 'hidden';
        RegistrarContainer.style.opacity = 0;
    })


    let Adicionar_Button = document.getElementById('RegistrarButton')
    let Inputs = document.querySelectorAll('#Registrar > input, #Registrar > select, #Registrar textarea')
    Adicionar_Button.addEventListener('click', async () => {
        let Complete = true;
        for (const Elemento of Inputs) {
            if (Elemento.getAttribute('id') == 'DataAgendamento' && Elemento.value.length <= Elemento.getAttribute('minlength')){
                Complete = false
                Elemento.value = '';
                Elemento.setAttribute('placeholder', `Data Inválida`);
                Elemento.style.backgroundColor = '#aa0000'
                setTimeout(() => {
                    Elemento.style.backgroundColor = ''
                    Elemento.setAttribute('placeholder', 'Data do Agendamento')
                }, 2000);
            }
            else if (Elemento.getAttribute('id') == 'Orientador'){
                if (Elemento.value == ''){
                    Complete = false
                    Elemento.style.backgroundColor = '#aa0000'
                    Elemento.children[0].text = 'Orientador Inválido!'
                    setTimeout(() => {
                        Elemento.style.backgroundColor = ''
                        Elemento.children[0].text = 'Selecione um Orientador'
                    }, 2000);
                }
            }

            else{
                if (Elemento.value.length < Elemento.getAttribute('minlength')){
                    Complete = false
                    Elemento.style.backgroundColor = '#aa0000';
                    setTimeout(() => {
                        Elemento.style.backgroundColor = '';
                    }, 2000);
                }
            }
        }
        if (Complete){
            Resposta = await fetch('AddCliente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': TOKEN
                },
                body: JSON.stringify({
                    'Nome': Inputs[0].value,
                    'Orientador': Inputs[1].value,
                    'Data': Inputs[2].value,
                    'Acompanhante': Inputs[3].value,
                    'Curso': Inputs[4].value,
                    'Celular': Inputs[5].value,
                    'Observacoes': Inputs[6].value
                })
            })

            Inputs.forEach((Elemento => {
                Elemento.value = ''
            }))
            RegistrarContainer.style.visibility = 'hidden';
            document.getElementById('Data').dispatchEvent(new Event('change'))
        }
    })
}

async function GetOrientador(OrientadorID){
    let response;
    if (OrientadorID){
        response = await fetch('GetOrientadores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': TOKEN
            },
            body: JSON.stringify({'ID': OrientadorID})
        })
    }
    else{
        response = await fetch('GetOrientadores')
    }
    

    let Data = await response.json();
    
    return Data
}

async function GetAgendamentos(Inicio, Final) {
    let Response = await fetch('GetAgendamentos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': TOKEN,
        },
        body: JSON.stringify({'Inicio': Inicio, 'Final': Final})
    })

    let Data = await Response.json()

    return Data
}

async function LoadAgendamentos() {
    const Data = document.getElementById('Data')
    Data.addEventListener('change', async () => {
        let Datas_Inicio_Final;

        //Verifica e formata as datas para o formato padrão ISO
        if (Data.value.split(' ').length > 1){
            let Inicio = Data.value.split(' ')[0].split('/').reverse().join('-');
            let Final = Data.value.split(' ')[2].split('/').reverse().join('-');
            Datas_Inicio_Final = [Inicio, Final];
        }

        else{
            Datas_Inicio_Final = Data.value.split(' ')[0].split('/').reverse().join('-');
        }


        if (typeof Datas_Inicio_Final != 'string'){
            let Dados = await GetAgendamentos(Datas_Inicio_Final[0], Datas_Inicio_Final[1], TOKEN)
            let Dias = DayGenerator(Dados['Datas'])
            AgendamentosGenerator(Dias, TOKEN)
        }
        else{
            let Dados = await GetAgendamentos(Datas_Inicio_Final, Datas_Inicio_Final, TOKEN)
            let Dias = DayGenerator(Dados['Datas'])
            AgendamentosGenerator(Dias, TOKEN)
        }
    })
}

function DayGenerator(Dias) {
    const Agendamentos = document.getElementById('Agendamentos') 
    Agendamentos.innerHTML = ''

    if (!WindowEventsAdded){
        WindowEventsAdded = true
        window.addEventListener('resize', () => {
            if(window.innerWidth < 768){
                Dias.length > 1 ? Agendamentos.style.justifyContent = 'start' : Agendamentos.style.justifyContent = 'center'
            }
            else{
                Dias.length > 4 ? Agendamentos.style.justifyContent = 'start' : Agendamentos.style.justifyContent = 'center'
            }
        })
    }
    

    if(window.innerWidth < 768){
        Dias.length > 1 ? Agendamentos.style.justifyContent = 'start' : Agendamentos.style.justifyContent = 'center'
    }
    else{
        Dias.length > 4 ? Agendamentos.style.justifyContent = 'start' : Agendamentos.style.justifyContent = 'center'
    }

    for (let Dia in Dias){
        let Weekday = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
        let Data = new Date(`${Dias[Dia]}T00:00:00`)
        let DataFormatada = `${Weekday[Data.getDay()]} - ${Data.getDate() >= 10 ? Data.getDate() : '0'+Data.getDate()}/${Data.getMonth()+1 >= 10 ? Data.getMonth()+1 : '0'+(Data.getMonth()+1)}`
        let Container = document.createElement('article')
        let ContainerHeader = document.createElement('header')
        let ContainerBody = document.createElement('section')
        Container.appendChild(ContainerHeader)
        Container.appendChild(ContainerBody)
        Container.classList.add('Dia')
        Container.setAttribute('Data-Date', `${Data.getFullYear()}-${Data.getMonth()+1}-${Data.getDate()}`)
        ContainerHeader.innerHTML = DataFormatada
        Agendamentos.appendChild(Container)
    }

    return document.querySelectorAll('article.Dia')
}

async function AgendamentosGenerator(Days) {

    Days.forEach(async Day => {
        Data = Day.getAttribute('Data-Date')
        let Agendamentos = await GetAgendamentos(Data, Data)
        let Container = Day.children[1]
        Container.innerHTML = ''
        for (let i = 0; i < Object.keys(Agendamentos.Agendamentos).length; i++) {
            const Data = Agendamentos.Agendamentos[i];
            let DadosContainer = document.createElement('ul');
            let botao_editar = document.createElement('i')
            botao_editar.classList.add('editbtn')
            DadosContainer.classList.add('Agendamento')
            let Nome = document.createElement('li');
            Nome.innerHTML = `<span>Aluno:</span> ${Data['Nome']}`
            let Curso = document.createElement('li');
            Curso.innerHTML = `<span>Curso:</span> ${Data['Curso']}`
            let OrientadorContainer = document.createElement('li')
            let Orientador = await GetOrientador(Data['Orientador'], TOKEN)
            OrientadorContainer.innerHTML = `<span>Orientador: </span> ${Orientador.Nome}`
            let Horario = document.createElement('li');
            let _ = new Date(Data['Data'])
            Horario.innerHTML = `<span>Horario:</span> ${_.getHours()}:${_.getMinutes() >= 10 ? _.getMinutes() : `0${_.getMinutes()}`}`
            DadosContainer.appendChild(Nome)
            DadosContainer.appendChild(Curso)
            DadosContainer.appendChild(OrientadorContainer)
            DadosContainer.appendChild(Horario)
            DadosContainer.appendChild(botao_editar)
            DadosContainer.setAttribute('data-orientador', Orientador['ID'])
            botao_editar.addEventListener('click', (event) =>{
                event.stopPropagation()
                editar_agendamento(Data)
            })
            let Color = document.createElement('i')
            Color.classList.add('ball')
            Color.style.backgroundColor = `#${Orientador.Cor}60`
            DadosContainer.appendChild(Color)
            DadosContainer.addEventListener('click', () => {
                InformationStatus(false, Object.values(Data).splice(1), Data['ID'])
            })
            Container.appendChild(DadosContainer)
        }
    })
}

function InformationPanel(){
    let Information = document.getElementById("Information");
    let CloseInformationPanelButton = document.getElementById("CloseInformation");

    CloseInformationPanelButton.addEventListener('click', () => {
        Information.removeAttribute('data-id')
        Information.style.opacity = '0'
        Information.style.visibility = 'hidden'
    })
}

function InformationStatus(Hidden, Dados, ID){
    let Information = document.getElementById('Information')
    let ContainerDosDados;
    document.querySelectorAll('#Dados span').length > 0 ? ContainerDosDados = document.querySelectorAll('#Dados span') : ContainerDosDados = document.querySelectorAll('#Dados input, #Dados textarea');
    Information.setAttribute('data-id', ID);

    document.querySelectorAll('.Salvar').forEach((Elemento) => {Elemento.remove()});

    ContainerDosDados.forEach(async (Elemento, Index) => {
        let Mensagem = document.createElement('span');

        if (Index == 1){
            let Orientador = await GetOrientador(Dados[Index]);
            Mensagem.innerHTML = Orientador.Nome;
        }
        else if(Index == 5){
            let Data = Dados[Index].split('T').slice(0, 1)[0].split('-').reverse().join('/')
            let Ano = Data.split('/')[2]
            let Mes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][Number(Data.split('/')[1])]
            let Dia = Data.split('/')[0]
            let Horario = Dados[Index].split('T').slice(1, 2)[0]
            Mensagem.innerHTML = `${Dia} de ${Mes} de ${Ano} às ${Horario.slice(0, 5)}`
        }
        else{
            Mensagem.innerHTML = Dados[Index];
        }
        Elemento.replaceWith(Mensagem);
    })

    if (Hidden){
        Information.style.visibility = 'hidden';
    }

    else{
        Information.style.visibility = 'visible';
        Information.style.opacity = '1';
    }
}

function InformationEdit(Hidden, Dados, ID){
    let Information = document.getElementById('Information');
    let ContainerDosDados = document.querySelectorAll('#Dados span');
    Information.setAttribute('data-id', ID);
    
    document.querySelectorAll('.Salvar').forEach((Elemento) => {Elemento.remove()});

    let NewData = {}

    ContainerDosDados.forEach(async (Elemento, Index) => {
        if (Index == 1){
            let Orientador = await GetOrientador(Dados[Index]);
            Elemento.innerHTML = Orientador.Nome;
        }
        else if(Index == 5){
            let Data = Dados[Index].split('T').slice(0, 1)[0].split('-').reverse().join('/')
            let Horario = Dados[Index].split('T')[1].slice(0, 5)
            Elemento.innerHTML = `${Data} ${Horario}`
        }
        else{
            Elemento.innerHTML = Dados[Index];
        }

        let NewElemento;
        Index != ContainerDosDados.length - 1 ? NewElemento = document.createElement('input') : NewElemento = document.createElement('textarea');
        Index == 4 ? NewElemento.type = 'number' : NewElemento.type = 'text';
        if (Index == 5){
            flatpickr(NewElemento, {'dateFormat': 'd/m/Y H:i','locale': 'pt', 'enableTime': true, 'time_24hr': true})
        }
        NewElemento.value = Elemento.innerHTML
        NewElemento.classList.add('EditOptions')
        Elemento.parentNode.replaceChild(NewElemento, Elemento)
        
    })
    let Salvar = document.createElement('button')
    Salvar.classList.add('Salvar')
    Salvar.innerHTML = 'Salvar Alterações'
    Salvar.addEventListener('click', async () => {
        Information.style.visibility = 'hidden'
        ContainerDosDados = document.querySelectorAll('#Dados input, #Dados textarea')
        NewData["ID"] = ID
        ContainerDosDados.forEach((Elemento, Index) => {
            let Keys = ['Nome', 'Orientador', 'Acompanhante', 'Curso', 'Celular', 'Data', 'Status', 'Presenca', 'Observacoes']
            NewData[Keys[Index]] = Elemento.value
        })

        response = await fetch('edit_cliente', {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                "X-CSRFToken": TOKEN,
            },
            body: JSON.stringify(NewData)
        })
        document.getElementById('Data').dispatchEvent(new Event('change'))

    })
    document.getElementById('Dados').appendChild(Salvar);

    if (Hidden){
        Information.style.visibility = 'hidden';
    }

    else{
        Information.style.visibility = 'visible';
        Information.style.opacity = '1';
    }
}

async function Remove() {
    let Information = document.getElementById("Information");
    let RemoveIconButton = document.getElementById("RemoveButton");
    let Confirmation = document.getElementById("DeleteConfirmationContainer");
    let DontRemoveButton = document.getElementById('DontRemove');
    let RemoveButton = document.getElementById('Remove');

    DontRemoveButton.addEventListener('click', () => {
        Confirmation.style.display = 'none';
    })

    RemoveIconButton.addEventListener('click', () => {

        if (Confirmation.style.display == 'flex'){
            Confirmation.style.display = 'none';
        }
        else{
            Confirmation.style.display = 'flex';
        }

    })

    RemoveButton.addEventListener('click', async () => {
        let CostumerID = Information.getAttribute('data-id')
        if (await DeleteCostumer(CostumerID) == 200){
            document.getElementById('Data').dispatchEvent(new Event('change'))
            Information.style.opacity = '0'
            Information.style.visibility = 'hidden'
        }
        else{
            alert('Ocorreu um erro, cliente já foi deletado ou não foi encontrado no banco de dados.')
        }

        Confirmation.style.display = 'none'
    })
}

async function editar_agendamento(Dados) {
    InformationEdit(false, Object.values(Dados).slice(1), Dados['ID']) 
}