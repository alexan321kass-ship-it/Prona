package com.login.userinterfaces;

import net.serenitybdd.screenplay.targets.Target;
import org.openqa.selenium.By;

/**
 * UserInterface / XPath de la página de login de Pronavid (web GAO)
 * URL: http://localhost:5173/login
 */
public class LoginPage {
    public static final Target INPUT_CORREO = Target.the("campo correo electrónico")
            .located(By.cssSelector("input[type='email']"));

    public static final Target INPUT_CONTRASENA = Target.the("campo contraseña")
            .located(By.cssSelector("input[type='password']"));

    public static final Target BOTON_LOGIN = Target.the("botón Iniciar Sesión")
            .located(By.cssSelector("button[type='submit']"));

    public static final Target MENSAJE_RESULTADO = Target.the("mensaje de resultado")
            .located(By.cssSelector(".mensaje"));
}