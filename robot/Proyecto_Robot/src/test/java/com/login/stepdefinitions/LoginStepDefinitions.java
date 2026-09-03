package com.login.stepdefinitions;

import com.login.tasks.AbrirPagina;
import com.login.tasks.RealizarLogin;
import com.login.questions.ValidarLogin;
import io.cucumber.java.Before;
import io.cucumber.java.es.*;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;

import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import static org.hamcrest.Matchers.containsString;

/**
 * STEP DEFINITIONS: Pasos del login de Pronavid (web GAO)
 * Siguiendo el patrón Given / When / Then de Serenity Screenplay + Cucumber
 */
public class LoginStepDefinitions {

    @Before
    public void prepararEscenario() {
        OnStage.setTheStage(new OnlineCast());
    }

    @Dado("el usuario abre la pagina de Pronavid")
    public void abrirPagina() {
        OnStage.theActorCalled("Admin").wasAbleTo(AbrirPagina.dePronavid());
    }

    @Cuando("ingresa correo {string} y contraseña {string}")
    public void ingresarCredenciales(String correo, String contrasena) {
        OnStage.theActorInTheSpotlight().attemptsTo(
            RealizarLogin.conCredenciales(correo, contrasena)
        );
    }

    @Entonces("valida que el login fue exitoso")
    public void validarLoginExitoso() {
        // Valida que la URL ya contiene /Dashboard (redirigió correctamente)
        OnStage.theActorInTheSpotlight().should(
            seeThat("la URL redirigió al Dashboard",
                ValidarLogin.urlActual(),
                containsString("Dashboard"))
        );
    }
}