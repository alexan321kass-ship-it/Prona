package com.producto.tasks;

import com.login.tasks.AbrirPagina;
import com.login.tasks.RealizarLogin;
import com.producto.userinterfaces.CatalogoPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Click;
import static net.serenitybdd.screenplay.Tasks.instrumented;

public class NavegarAlCatalogo implements Task {
    
    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            new AbrirPagina(),
            RealizarLogin.conCredenciales("nicolas220x@gmail.com", "1234567NmS")
        );
        try { Thread.sleep(2000); } catch (InterruptedException e) { e.printStackTrace(); }
        
        actor.attemptsTo(
            net.serenitybdd.screenplay.actions.Open.url("http://localhost:80/Catalogo")
        );
        try { Thread.sleep(2000); } catch (InterruptedException e) { e.printStackTrace(); }
    }

    public static NavegarAlCatalogo ejecutar() {
        return instrumented(NavegarAlCatalogo.class);
    }
}
