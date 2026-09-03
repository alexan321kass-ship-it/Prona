package com.asesor.tasks;

import com.login.tasks.AbrirPagina;
import com.login.tasks.RealizarLogin;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import static net.serenitybdd.screenplay.Tasks.instrumented;

public class NavegarComoAsesor implements Task {

    private final String url;

    public NavegarComoAsesor(String url) {
        this.url = url;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            new AbrirPagina(),
            RealizarLogin.conCredenciales("nue6689@gmail.com", "1013619198NmS")
        );
        try { Thread.sleep(2000); } catch (InterruptedException e) { e.printStackTrace(); }
        actor.attemptsTo(
            net.serenitybdd.screenplay.actions.Open.url("http://localhost:80" + url)
        );
        try { Thread.sleep(2000); } catch (InterruptedException e) { e.printStackTrace(); }
    }

    public static NavegarComoAsesor a(String url) {
        return instrumented(NavegarComoAsesor.class, url);
    }
}
