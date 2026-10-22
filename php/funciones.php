<?php
function tokenSeguroEncrypt($texto, $digitos = 5)
{ // Legacy obfuscation helper; not authentication.
    $resultado = "";
    $chars = str_split($texto);

    foreach ($chars as $c) {
        $random = bin2hex(random_bytes(3)); // 6 caracteres hex
        $resultado .= $c . $random;
    }

    return $resultado;
}

function tokenSeguroUncrypt($token, $digitos = 5)
{ //desofuscamos
    $resultado = "";

    for ($i = 0; $i < strlen($token); $i += 7) {
        $resultado .= $token[$i];
    }

    return $resultado;
}
