const TOKEN = document.getElementById('TOKEN').content

document.addEventListener('DOMContentLoaded', () => {

    const LogoutButton = document.getElementById('')

    flatpickr('#Data', {'dateFormat': 'd/m/Y','mode': 'range','locale': 'pt'})

    LoadAgendamentos();
    InformationPanel();
    Remove();
    
})

function FormatarData(Data) {
    let Horario = Data.split('T')[1]
    Data = Data.split('T')[0].split('-').reverse()
    Data[0] = Number(Data[0])
    Data[1] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][Number(Data[1])]
    return Data.join(' de ') + ` as ${Horario.slice(0, 5)}`
}

async function DelCostumer(ID) {
    response = await fetch('DelCostumer', {
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

async function GetOrientador(OrientadorID){
    let Response = await fetch('GetOrientadores', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': TOKEN
        },
        body: JSON.stringify({'ID': OrientadorID})
    })

    let Data = await Response.json()
    
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

function Logout() {
    sessionStorage.clear()
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

    if (Dias.length > 4){
        Agendamentos.style.justifyContent = 'start'
    }
    else{
        Agendamentos.style.justifyContent = 'center'
    }

    for (let Dia in Dias){
        let Weekday = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
        let Data = new Date(`${Dias[Dia]}T00:00:00`)
        let DataFormatada = `${Weekday[Data.getDay()]} - ${Data.getDate() >= 10 ? Data.getDate() : '0'+Data.getDate()}/${Data.getMonth()+1 >= 10 ? Data.getMonth()+1 : '0'+(Data.getMonth()+1)}`
        let Container = document.createElement('article')
        let ContainerHeader = document.createElement('header')
        let ContainerBody = document.createElement('section')
        ContainerBody.style.height = '80%'
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
        let Agendamentos = await GetAgendamentos(Data, Data, TOKEN)
        let Container = Day.children[1]
        Container.innerHTML = ''
        for (let i = 0; i < Object.keys(Agendamentos.Agendamentos).length; i++) {
            const Data = Agendamentos.Agendamentos[i];
            let Information = document.getElementById("Information");
            Information.setAttribute('data-id', Data['ID'])
            let DadosContainer = document.createElement('ul');
            DadosContainer.classList.add('Agendamento')
            let Nome = document.createElement('li');
            Nome.innerHTML = `<span>Aluno:</span> ${Data['Nome']}`
            let Curso = document.createElement('li');
            Curso.innerHTML = `<span>Curso:</span> ${Data['Curso']}`
            let OrientadorContainer = document.createElement('li')
            let Orientador = await GetOrientador(Data['Orientador']  , TOKEN)
            OrientadorContainer.innerHTML = `<span>Orientador: </span> ${Orientador.Nome}`
            let Horario = document.createElement('li');
            let _ = new Date(Data['Data'])
            Horario.innerHTML = `<span>Horario:</span> ${_.getHours()}:${_.getMinutes()}`
            DadosContainer.appendChild(Nome)
            DadosContainer.appendChild(Curso)
            DadosContainer.appendChild(OrientadorContainer)
            DadosContainer.appendChild(Horario)
            let Color = document.createElement('i')
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
        Information.style.opacity = '0'
        Information.style.visibility = 'hidden'
    })
}

function InformationStatus(Hidden, Dados, ID){
    let Information = document.getElementById('Information')
    let ContainerDosDados = document.querySelectorAll('#Dados span')
    Information.setAttribute('data-id', ID)

    ContainerDosDados.forEach(async (Elemento, Index) => {
        if (Dados[Index] == 1){
            let Orientador = await GetOrientador(Dados[Index], TOKEN)
            Elemento.innerHTML = Orientador.Nome
        }

        else if(Index == 5){
            Elemento.innerHTML = FormatarData(Dados[Index])
        }

        else{
            Elemento.innerHTML = Dados[Index]
        }

    })

    if (Hidden){
        Information.style.visibility = 'hidden';
        Information.style.opacity = '0';
    }

    else{
        Information.style.visibility = 'visible';
        Information.style.opacity = '1';
    }
}

async function Remove() {
    let Information = document.getElementById("Information");
    let RemoveIconButton = document.getElementById("RemoveButton")
    let Confirmation = document.getElementById("DeleteConfirmationContainer")
    let DontRemoveButton = document.getElementById('DontRemove')
    let RemoveButton = document.getElementById('Remove')

    RemoveIconButton.addEventListener('click', () => {

        if (Confirmation.style.display == 'flex'){
            Confirmation.style.display = 'none'
        }
        else{
            Confirmation.style.display = 'flex'
        }

    })

    RemoveButton.addEventListener('click', async () => {
        let CostumerID = Information.getAttribute('data-id')
        if (await DelCostumer(CostumerID) == 200){
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