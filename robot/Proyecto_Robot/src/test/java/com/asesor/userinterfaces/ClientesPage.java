package com.asesor.userinterfaces;

import net.serenitybdd.screenplay.targets.Target;
import org.openqa.selenium.By;

/**
 * Mapa de UI: Gestión de Clientes — /clientes
 */
public class ClientesPage {

    // Listado
    public static final Target BTN_NUEVO_CLIENTE = Target.the("Botón Nuevo Cliente")
            .located(By.cssSelector("button.btn-primary"));

    public static final Target BARRA_BUSQUEDA = Target.the("Barra de búsqueda de clientes")
            .located(By.cssSelector("input.autocompletado-input, input[placeholder*='nombre']"));

    public static Target filaNombreCliente(String nombre) {
        return Target.the("Fila del cliente " + nombre)
                .located(By.xpath("//td[normalize-space(text())='" + nombre + "']"));
    }

    public static Target btnEditarCliente(String nombre) {
        return Target.the("Botón Editar cliente " + nombre)
                .located(By.xpath("//td[normalize-space(text())='" + nombre + "']/following-sibling::td//button[contains(@class,'btn-edit')]"));
    }

    public static Target btnEliminarCliente(String nombre) {
        return Target.the("Botón Eliminar cliente " + nombre)
                .located(By.xpath("//td[normalize-space(text())='" + nombre + "']/following-sibling::td//button[contains(@class,'btn-delete')]"));
    }

    // Formulario Modal
    public static final Target INPUT_NOMBRE = Target.the("Nombre del cliente")
            .located(By.cssSelector("input[name='nombre_cliente']"));

    public static final Target INPUT_IDENTIFICACION = Target.the("Identificación del cliente")
            .located(By.cssSelector("input[name='identificacion']"));

    public static final Target INPUT_TELEFONO = Target.the("Teléfono del cliente")
            .located(By.cssSelector("input[name='telefono']"));

    public static final Target INPUT_CORREO = Target.the("Correo del cliente")
            .located(By.cssSelector("input[name='correo']"));

    public static final Target INPUT_DIRECCION = Target.the("Dirección del cliente")
            .located(By.cssSelector("input[name='direccion']"));

    public static final Target BTN_GUARDAR = Target.the("Botón Guardar cliente")
            .located(By.cssSelector("form button[type='submit'].btn-primary"));
}
