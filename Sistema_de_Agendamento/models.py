from django.db import models
from django.db.models import UniqueConstraint

class Orientadores(models.Model):

    ID = models.AutoField(primary_key = True)
    Nome = models.CharField(max_length = 255)
    Senha = models.CharField(max_length = 255)
    Cor = models.CharField(max_length = 6)

    def __str__(self):
        return self.Nome

class Clientes(models.Model):

    ID = models.AutoField(primary_key = True)
    Nome = models.CharField(max_length = 255)
    Orientador = models.ForeignKey(Orientadores, models.CASCADE)
    Acompanhante = models.CharField(max_length = 255, blank = True, null = True)
    Curso = models.CharField(max_length = 255)
    Celular = models.CharField(max_length=11)
    Data = models.DateTimeField()
    Presenca = models.CharField(max_length = 1, default = '0', choices=(('0', 'Ausente'), ('1', 'Presente')))
    Status = models.CharField(max_length = 1, default = '2', choices=(('0', 'Recusou'), ('1', 'Comprou'), ('2', 'Negociando')))
    Observacoes = models.CharField(max_length = 255)