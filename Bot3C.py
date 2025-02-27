from selenium.webdriver import Chrome, ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from time import sleep, strftime
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "SA.settings")
django.setup()

from Sistema_de_Agendamento.models import chamadas, orientadores


class Bot():
    
    def __init__(self, Orientador: str):
        Options = ChromeOptions()
        # Options.add_argument(f'--user-data-dir=C:\\Users\\Heric\\appdata\\roaming\\undetected_chromedriver\\profile_{Orientador}')
        Options.add_argument('--headless')
        self.Orientador = Orientador
        self.Driver = Driver = Chrome(options=Options)
        self.Wait = Wait = WebDriverWait(Driver, 10)
        
        Driver.maximize_window()

        Driver.get('https://ercougocia.3c.plus/login')

        Wait.until(EC.presence_of_element_located((By.ID, 'user'))).send_keys('1004')
        Wait.until(EC.presence_of_element_located((By.ID, 'password'))).send_keys('Heric@2025')
        Wait.until(EC.presence_of_element_located((By.ID, 'password'))).send_keys(Keys.RETURN)

        Wait.until(lambda x: Driver.current_url != 'https://ercougocia.3c.plus/login')

        Driver.get('https://ercougocia.3c.plus/manager/calls-report')

        Wait.until(lambda x: Driver.execute_script('return document.readyState == "complete" || document.readyState == "loaded"'))

        elemento_pai = Wait.until(EC.presence_of_element_located((By.XPATH, '/html/body/div[1]/div/div[1]/div/div[2]/div[1]/div[2]/div[3]/div/div/div[3]')))

        Elementos = Wait.until(lambda x: elemento_pai.find_elements(By.CLASS_NAME, 'multiselect__element'))

        for Elemento in Elementos:
            _ = Wait.until(EC.presence_of_element_located((By.XPATH, '/html/body/div[1]/div/div[1]/div/div[2]/div[1]/div[2]/div[3]/div/div/div[3]'))) #Botão para abrir menu de Orientadores
            Driver.execute_script('arguments[0].style = "" ', _)
            #Achamos o Primeiro Span dentro do Elemento, Ao Acessar o primeiro span temos outro no qual contem o nome dos usuarios
            Nome = Elemento.find_element(By.TAG_NAME, 'span').find_element(By.TAG_NAME, 'span').get_attribute('innerHTML').split(' ')
            if len(Nome) > 1:
                Nome = Nome[2]
            else:
                Nome = False
            ID = Elemento.get_attribute('id')
            
            if Nome == Orientador:
                Elemento = Driver.find_element(By.ID, ID).find_element(By.TAG_NAME, 'span')
                Driver.execute_script('arguments[0].dispatchEvent(new Event("click"))', Elemento)
        
        self.Loop()

    def ChamadasTotais(self):
        #Botão para buscar o contato que foi selecionado
        self.Driver.find_element(By.XPATH, '/html/body/div[1]/div/div[1]/div/div[2]/div[1]/div[2]/div[5]/button').click()
        
        #Botão para mostrar total de ligações
        self.Driver.find_element(By.XPATH, '/html/body/div[1]/div/div[1]/div/div[2]/div[1]/div[6]/div[2]/div/div[3]/button').click()
        
        #Total de ligações
        try:
            Chamadas = self.Wait.until(EC.visibility_of_element_located((By.XPATH, '/html/body/div[1]/div/div[1]/div/div[2]/div[1]/div[6]/div[2]/div/div[2]/div/table/tbody/tr[3]/td[3]'))).get_attribute('innerHTML')
        except: 
            Chamadas = 0
        return Chamadas
    
    def ChamadasAtendidas(self):
            
            try:
                MinDurationBtn = self.Driver.find_element('/html/body/div[1]/div/div[1]/div/div[2]/div[1]/div[5]/div[1]/div[8]/div/input')
                self.Driver.execute_script('arguments[0].setAttribute("value", "00:30")', (MinDurationBtn, ))
                
                #Botão para buscar o contato que foi selecionado
                self.Driver.find_element(By.XPATH, '/html/body/div[1]/div/div[1]/div/div[2]/div[1]/div[2]/div[5]/button').click()
                
                #Botão para mostrar total de ligações
                self.Driver.find_element(By.XPATH, '/html/body/div[1]/div/div[1]/div/div[2]/div[1]/div[6]/div[2]/div/div[3]/button').click()
                
                Atendidas = self.Wait.until(EC.visibility_of_element_located((By.XPATH, '/html/body/div[1]/div/div[1]/div/div[2]/div[1]/div[6]/div[2]/div/div[2]/div/table/tbody/tr[3]/td[3]'))).get_attribute('innerHTML')
            except:
                Atendidas = 0
            
            return Atendidas

    def Loop(self):
        while True:
            self.total_calls()

            sleep(1)
    
    
    def total_calls(self):
        try:
            horarios = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00']
            if strftime('%H:%M') in horarios:
                Chamadas = self.ChamadasTotais()
                Atendidas = self.ChamadasAtendidas()
                print(Chamadas, Atendidas)
                chamadas(orientador = orientadores.objects.get(Nome = self.Orientador), chamadas = Chamadas, horario = strftime('%H:%M'), atendidas = Atendidas).save()
                sleep(60)
        except Exception as Error: 
            print(Error)


from threading import Thread

for orientador in orientadores.objects.all():
    Thread(target = Bot, args=(orientador.Nome,), name = orientador.Nome).start()