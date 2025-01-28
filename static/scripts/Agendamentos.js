document.addEventListener('DOMContentLoaded', () => {
    const Token = document.getElementById("TOKEN").getAttribute("content");
    Logout();
    DataInputAgendamentos(Token);
});

function ConverterParaISO(Data) {
    return `${Data.split('/')[2]}-${Data.split('/')[1]}-${Data.split('/')[0]}`
}

async function GetOrientadores() {
    try {
        const Response = await fetch('GetOrientadores/')
        const Data = await Response.json()
        return Data
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function GetAgendamentos(Token, Inicio, Final) {
    try {

        const Response = await fetch('GetAgendamentos/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': Token
            },
            body: JSON.stringify({'Inicio': Inicio, 'Final': Final})
        })
        const Clientes = await Response.json()
        const Orientadores = await GetOrientadores()
        const Agendamentos = document.getElementById('Agendamentos')

        Agendamentos.style.justifyContent = 'start'

        let MesmaData = {}
        for (index in Clientes){
            let Data = Clientes[index]['Data'].split('T')[0].split('-').reverse().join('/')
            if (Data in MesmaData){
                MesmaData[Data].push(Clientes[index])
            }
            else{
                MesmaData[Data] = []
                MesmaData[Data].push(Clientes[index])
            }
        }

        Agendamentos.innerHTML = ''
        console.log()
        for (Data in MesmaData){
            let Dia = document.createElement('section');
            Dia.classList.add('Dia');
            let DiaDaSemana = new Date(Data.split('/').reverse().join('-')).getDay()
            DiaDaSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'][DiaDaSemana] 
            let DiaHeader = document.createElement('header');
            DiaHeader.innerHTML = `${DiaDaSemana} - ${Data.slice(0, 5)}`;
            Dia.appendChild(DiaHeader);
            Agendamentos.appendChild(Dia);
            
            for (let index in MesmaData[Data]){
                let ID = MesmaData[Data][index]['Orientador']
                let Cor = Orientadores[ID]['Cor']
                let Agendamento = document.createElement('ul');
                Agendamento.setAttribute('Data-id', ID) 
                Agendamento.style.borderTop = `15px solid #${Cor}`
                Agendamento.classList.add('Agendamento');
                let Cliente = MesmaData[Data][index]
                let Horario = Cliente['Data'].split('T')[1].slice(0, 5)
                Agendamento.innerHTML += `<li>${Cliente['Nome']}</li>`
                Agendamento.innerHTML += `<div> <img src='../static/Horario.png' class='Horario'></img> <li>${Horario}</li> </div>`
                Dia.appendChild(Agendamento)
            }
        }



    } catch (error) {
        console.log(error)
    }
    
}


function DataInputAgendamentos(Token) {
    let Data = document.getElementById('Data')
    flatpickr.localize(flatpickr.l10ns.pt)
    flatpickr(Data, {
        mode: 'range',
        dateFormat: 'd/m/Y',
    })
    Data.addEventListener('change', () => {
        if (Data.value.split(' ').length > 2){
        let Inicio = ConverterParaISO(Data.value.split(' ')[0])
        let Final = ConverterParaISO(Data.value.split(' ')[2])
        GetAgendamentos(Token, Inicio, Final)
        }
    })
}


function Logout() {
    let Sair = document.getElementById('Sair')
    Sair.addEventListener('click', () => {
        fetch('/Logout', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(Response => {
            if(!Response.ok){
                throw new Error("Ocorreu um erro ao realizar Logout!");
            }
        }).then(Data => {
            window.location.href = '/Login'
        }).catch(Error => {
            console.log(`Erro ${Error}`)
        })
    });    
}