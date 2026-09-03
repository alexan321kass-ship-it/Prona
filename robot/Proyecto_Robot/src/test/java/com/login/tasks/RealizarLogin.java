package com.login.tasks;

import com.login.userinterfaces.LoginPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import static net.serenitybdd.screenplay.Tasks.instrumented;

/**
 * TASK: Realiza el login en la web de Pronavid (GAO)
 * Ingresa correo y contraseña y hace clic en el botón de Iniciar Sesión
 */
public class RealizarLogin implements Task {
    private final String correo;
    private final String contrasena;

    public RealizarLogin(String correo, String contrasena) {
        this.correo = correo;
        this.contrasena = contrasena;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        try { Thread.sleep(1500); } catch (InterruptedException e) { e.printStackTrace(); }
        actor.attemptsTo(
            Enter.theValue(correo).into(LoginPage.INPUT_CORREO),
            Enter.theValue(contrasena).into(LoginPage.INPUT_CONTRASENA),
            Click.on(LoginPage.BOTON_LOGIN)
        );
        try { Thread.sleep(2000); } catch (InterruptedException e) { e.printStackTrace(); }
    }

    public static RealizarLogin conCredenciales(String correo, String contrasena) {
        return instrumented(RealizarLogin.class, correo, contrasena);
    }
}