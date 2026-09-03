package com.login.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.abilities.BrowseTheWeb;

/**
 * QUESTION: Valida que el login en Pronavid fue exitoso
 * Verifica que la URL actual ya no sea /login (redirigió al Dashboard)
 */
public class ValidarLogin {

    /**
     * Retorna la URL actual del navegador después del login
     * Si el login fue exitoso, la URL contendrá /Dashboard
     */
    public static Question<String> urlActual() {
        return actor -> BrowseTheWeb.as(actor).getDriver().getCurrentUrl();
    }

    /**
     * Retorna el título de la página actual
     */
    public static Question<String> tituloPagina() {
        return actor -> BrowseTheWeb.as(actor).getDriver().getTitle();
    }
}