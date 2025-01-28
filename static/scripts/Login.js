document.addEventListener('DOMContentLoaded', () => {
    const Token = document.getElementById('TOKEN').getAttribute('content')
    let Submit = document.getElementById("Submit")
    Submit.addEventListener('click', () => {
        let Usuario = document.getElementById("Usuario")
        let Senha = document.getElementById("Senha")
        if (Usuario.value != ""){
            fetch('', {
                method: "POST",
                headers: {
                    "Content-Type": 'application/json',
                    'X-CSRFToken': Token
                },
                body: JSON.stringify({
                    'Usuario': Usuario.value,
                    'Senha': Senha.value
                    }
                )
            }).then(Response => {
                Usuario.value = ''
                Senha.value = ''
                if (!Response.ok){
                    throw new Error(`Ocorreu um erro ${Response.status}`);
                }
                return Response.json()
            }).then(Data => {
                if (Data["Status"] == "Fail"){
                    Usuario.addEventListener('change', () => {
                        Usuario.style.backgroundColor = '#202020'
                        Senha.style.backgroundColor = '#202020'
                    })
                    Usuario.style.backgroundColor = '#ff000020';
                    Senha.style.backgroundColor = '#ff000020';
                }
                else if (Data["Status"] == "Success"){
                    window.location.href = '/Agendamentos';
                }
                
            })    
        }
        else{
            Usuario.style.backgroundColor = '#ff000020'
            Senha.style.backgroundColor = '#ff000020'
        }
    })
})