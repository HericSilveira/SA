from django.db import models
from django.db.models import UniqueConstraint

class orientadores(models.Model):

    ID = models.AutoField(primary_key = True)
    Nome = models.CharField(max_length = 255)
    Senha = models.CharField(max_length = 255)
    Cor = models.CharField(max_length = 6)

    def __str__(self):
        return self.Nome

class clientes(models.Model):

    ID = models.AutoField(primary_key = True)
    nome = models.CharField(max_length = 255)
    orientador = models.ForeignKey(orientadores, models.CASCADE)
    acompanhante = models.CharField(max_length = 255, blank = True, null = True)
    curso = models.CharField(max_length = 255)
    celular = models.CharField(max_length=11)
    data_agendada = models.DateTimeField()
    data_registrado = models.DateTimeField(auto_now_add=True)
    presenca = models.CharField(max_length = 1, default = '0', choices=(('0', 'Ausente'), ('1', 'Presente'), ('2', '')))
    status = models.CharField(max_length = 1, default = '2', choices=(('0', 'Recusou'), ('1', 'Comprou'), ('2', 'Negociando'), ('3', '')))
    observacoes = models.CharField(max_length = 255)
    
    def __str__(self):
        return f"ID {self.ID}: {self.nome}"
    
class chamadas(models.Model):
    
    orientador = models.ForeignKey(orientadores, models.CASCADE)
    chamadas = models.IntegerField()
    atendidas = models.IntegerField()
    data = models.DateField(auto_now=True)
    horario = models.TimeField()