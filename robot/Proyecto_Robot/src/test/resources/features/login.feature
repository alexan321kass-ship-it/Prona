# language: es
Característica: Login de administrador en Pronavid

  @60062
  Escenario: Login exitoso con credenciales de admin en la web GAO
    Dado el usuario abre la pagina de Pronavid
    Cuando ingresa correo "nicolas220x@gmail.com" y contraseña "1234567NmS"
    Entonces valida que el login fue exitoso
