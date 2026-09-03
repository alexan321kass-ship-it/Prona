package com.login.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Open;
import static net.serenitybdd.screenplay.Tasks.instrumented;

/**
 * TASK: Abre la página de login de Pronavid (web GAO)
 */
public class AbrirPagina implements Task {
    @Override
    public <T extends Actor> void performAs(T actor) {
        try { Thread.sleep(1500); } catch (InterruptedException e) { e.printStackTrace(); }
        actor.attemptsTo(Open.url("http://localhost:80/login"));
        try { Thread.sleep(1000); } catch (InterruptedException e) { e.printStackTrace(); }
    }

    public static AbrirPagina dePronavid() {
        return instrumented(AbrirPagina.class);
    }
}