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
            console.log(Dados)
        }
        else{
            let Dados = await GetAgendamentos(Datas_Inicio_Final, Datas_Inicio_Final, TOKEN)
            console.log(Dados)
        }
    })
}

