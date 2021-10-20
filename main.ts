let result = 0
while (!(ASR.begin(ASR.ModeEnum.LOOP, ASR.MicrophoneModeEnum.MIC))) {
    serial.writeLine("Communication with device failed, please check connection")
    basic.pause(2000)
}
serial.writeLine("Begin ok!")
if (ASR.addCommand("kai deng", 1)) {
    serial.writeLine("Set key words kai deng succeed!")
}
if (ASR.addCommand("guan deng", 2)) {
    serial.writeLine("Set key words guan deng succeed!")
}
ASR.start()
serial.writeLine("Start speech recognition!")
basic.showLeds(`
    . . . . .
    . # # # .
    . # # # .
    . # # # .
    . . . . .
    `)
led.enable(false)
basic.forever(function () {
    result = ASR.read()
    if (1 == result) {
        serial.writeLine("received'kai deng',command flag'0'")
        led.enable(true)
    } else if (2 == result) {
        serial.writeLine("received'guan deng',command flag'1'")
        led.enable(false)
    }
    basic.pause(200)
})
