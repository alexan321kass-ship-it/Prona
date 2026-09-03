package com.asesor.questions;

import com.asesor.userinterfaces.PedidosPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.questions.Visibility;

public class ElMensajeDeExito implements Question<Boolean> {

    @Override
    public Boolean answeredBy(Actor actor) {
        return Visibility.of(PedidosPage.MENSAJE_EXITO).answeredBy(actor);
    }

    public static ElMensajeDeExito estaVisible() {
        return new ElMensajeDeExito();
    }
}
