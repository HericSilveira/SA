document.addEventListener('DOMContentLoaded', () => {

    const TOKEN = document.getElementById('TOKEN').content

    flatpickr('#Data', {'dateFormat': 'd/m/Y','mode': 'range','locale': 'pt'})

    LoadAgendamentos(TOKEN)
    
})


async function GetAgendamentos(Inicio, Final, TOKEN) {
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

async function LoadAgendamentos(TOKEN) {
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

    for (let Dia in Dias){
        let Weekday = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
        let Data = new Date(`${Dias[Dia]}T00:00:00`)
        let DataFormatada = `${Weekday[Data.getDay()]} - ${Data.getDate() >= 10 ? Data.getDate() : '0'+Data.getDate()}/${Data.getMonth() >= 10 ? Data.getMonth()+1 : '0'+(Data.getMonth()+1)}`
        
        let Container = document.createElement('ul')
        let ContainerHeader = document.createElement('header')
        let ContainerBody = document.createElement('section')
        Container.appendChild(ContainerHeader)
        Container.appendChild(ContainerBody)
        Container.classList.add('Dia')
        Container.setAttribute('Data-Date', `${Data.getFullYear()}-${Data.getMonth()+1}-${Data.getDate()}`)
        ContainerHeader.innerHTML = DataFormatada
        Agendamentos.appendChild(Container)
    }

    return document.querySelectorAll('ul.Dia')
}

async function AgendamentosGenerator(Days, TOKEN) {

    Days.forEach(async Day => {
        Data = Day.getAttribute('Data-Date')
        let Agendamentos = await GetAgendamentos(Data, Data, TOKEN)
        let Container = Day.children[1]
        Container.innerHTML = ''
        for (let i = 0; i < Object.keys(Agendamentos.Agendamentos).length; i++) {
            const Data = Agendamentos.Agendamentos[i];
            let DadosContainer = document.createElement('ul');
            let Nome = document.createElement('li');
            Nome.innerHTML = Data['Nome']
            let Curso = document.createElement('li');
            Curso.innerHTML = Data['Curso']
            let Horario = document.createElement('li');
            let _ = new Date(Data['Data'])
            Horario.innerHTML = `${_.getHours()}:${_.getMinutes()}`
            DadosContainer.appendChild(Nome)
            DadosContainer.appendChild(Curso)
            DadosContainer.appendChild(Horario)
            Container.appendChild(DadosContainer)
        }
    })
}