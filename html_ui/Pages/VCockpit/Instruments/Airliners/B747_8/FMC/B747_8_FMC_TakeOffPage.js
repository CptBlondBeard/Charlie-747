class FMCTakeOffPage {
    static ShowPage1(fmc, store = {requestData: "<SEND"}) {
        fmc.clearDisplay();
        fmc.updateVSpeeds();
        FMCTakeOffPage._timer = 0;
        fmc.pageUpdate = () => {
            FMCTakeOffPage._timer++;
            if (FMCTakeOffPage._timer >= 15) {
                FMCTakeOffPage.ShowPage1(fmc);
            }
        };
        let v1 = "---";
        if (fmc.v1Speed) {
            v1 = fmc.v1Speed + "KT";
        }
        fmc.onRightInput[0] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            if (value === FMCMainDisplay.clrValue) {
                fmc.v1Speed = undefined;
                SimVar.SetSimVarValue("L:AIRLINER_V1_SPEED", "Knots", -1);
                FMCTakeOffPage.ShowPage1(fmc);
            }
            else if (value === "") {
                fmc._computeV1Speed();
                FMCTakeOffPage.ShowPage1(fmc);
            }
            else {
                if (fmc.trySetV1Speed(value)) {
                    FMCTakeOffPage.ShowPage1(fmc);
                }
            }
        };
        let vR = "---";
        if (fmc.vRSpeed) {
            vR = fmc.vRSpeed + "KT";
        }
        fmc.onRightInput[1] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            if (value === FMCMainDisplay.clrValue) {
                fmc.vRSpeed = undefined;
                SimVar.SetSimVarValue("L:AIRLINER_VR_SPEED", "Knots", -1);
                FMCTakeOffPage.ShowPage1(fmc);
            }
            else if (value === "") {
                fmc._computeVRSpeed();
                FMCTakeOffPage.ShowPage1(fmc);
            }
            else {
                if (fmc.trySetVRSpeed(value)) {
                    FMCTakeOffPage.ShowPage1(fmc);
                }
            }
        };
        let v2 = "---";
        if (fmc.v2Speed) {
            v2 = fmc.v2Speed + "KT";
        }
        fmc.onRightInput[2] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            if (value === FMCMainDisplay.clrValue) {
                fmc.v2Speed = undefined;
                SimVar.SetSimVarValue("L:AIRLINER_V2_SPEED", "Knots", -1);
                FMCTakeOffPage.ShowPage1(fmc);
            }
            else if (value === "") {
                fmc._computeV2Speed();
                FMCTakeOffPage.ShowPage1(fmc);
            }
            else {
                if (fmc.trySetV2Speed(value)) {
                    FMCTakeOffPage.ShowPage1(fmc);
                }
            }
        };
        let flapsCell = "---";
        let flapsAngle = fmc.getTakeOffFlap();
        if (isFinite(flapsAngle) && flapsAngle >= 0) {
            flapsCell = flapsAngle.toFixed(0) + "°";
        }
        else {
            flapsCell = "□□°";
        }
        fmc.onLeftInput[0] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            if (fmc.setTakeOffFlap(value)) {
                FMCTakeOffPage.ShowPage1(fmc);
            }
        };
        let thrRedCell = "";
        if (isFinite(fmc.thrustReductionAltitude)) {
            thrRedCell = fmc.thrustReductionAltitude.toFixed(0);
        }
        else {
            thrRedCell = "---";
        }
        thrRedCell += "FT";
        fmc.onLeftInput[2] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            if (fmc.trySetThrustReductionAccelerationAltitude(value)) {
                FMCTakeOffPage.ShowPage1(fmc);
            }
        };
        let runwayCell = "---";
        let posCell = "----";
        let selectedRunway = fmc.flightPlanManager.getDepartureRunway();
        if (selectedRunway) {
            runwayCell = Avionics.Utils.formatRunway(selectedRunway.designation);
        }

        let cgCell = "--%";
        if (isFinite(fmc.zeroFuelWeightMassCenter)) {
            cgCell = fmc.zeroFuelWeightMassCenter.toFixed(0) + "%";
        }
        fmc.onRightInput[3] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            fmc.setZeroFuelCG(value, (result) => {
                if (result) {
                    FMCTakeOffPage.ShowPage1(fmc);
                }
            });
        };

        let trimCell = "";
        if (isFinite(fmc.takeOffTrim)) {
            trimCell = fmc.takeOffTrim.toFixed(1);
        }

        let thrustCell = fmc.getThrustTakeOffTemp() + "°";
        let thrustTOMode = fmc.getThrustTakeOffMode();
        if (thrustTOMode === 0) {
            thrustTOMode = "TO[s-text]"
        } else if (thrustTOMode === 1) {
            thrustTOMode = "TO 1[s-text]"
        } else if (thrustTOMode === 2) {
            thrustTOMode = "TO 2[s-text]"
        }
        
        let grossWeightCell = "---.-";
        if (isFinite(fmc.getWeight(true))) {
            grossWeightCell = fmc.getWeight(true).toFixed(1);
        }
        
        let TOgrossWeightCell = "---.-";
        let taxiFuel = 0.6;
        if (isFinite(fmc.getWeight(true))) {
            if (fmc.simbrief.taxiFuel) {
                taxiFuel = fmc.simbrief.taxiFuel / 1000;
            }
            TOgrossWeightCell = (fmc.getWeight(true) - taxiFuel).toFixed(1);
        }

        let refSpdsCell = "off←→ON";
        const updateView = () => {
            fmc.setTemplate([
                ["TAKEOFF REF", "1", "2"],
                ["\xa0FLAPS", "V1"],
                [flapsCell, v1],
                ["\xa0THRUST", "VR"],
                [`${thrustCell}\xa0\xa0${thrustTOMode}`, vR],
                ["\xa0CG\xa0\xa0\xa0TRIM", "V2"],
                [`${cgCell}\xa0\xa0\xa0${trimCell}`, v2],
                ["\xa0RWY/POS", "TOGW", "GR WT"],
                [`${runwayCell}/${posCell}`, `${TOgrossWeightCell}`, `${grossWeightCell}[s-text]`],
                ["\xa0REQUEST", "REF SPDS"],
                [`${store.requestData}`, `${refSpdsCell}`],
                ["__FMCSEPARATOR"],
                ["<INDEX", "THRUST LIM>"]
            ]);
        }
        updateView();

        fmc.onPrevPage = () => {
            FMCTakeOffPage.ShowPage2(fmc);
        };
        fmc.onNextPage = () => {
            FMCTakeOffPage.ShowPage2(fmc);
        };
        fmc.onLeftInput[5] = () => { B747_8_FMC_InitRefIndexPage.ShowPage1(fmc); };
        fmc.onRightInput[5] = () => { FMCThrustLimPage.ShowPage1(fmc); };
    }
    static ShowPage2(fmc) {        
        fmc.clearDisplay();
        let altnThrust = "TO";
        let eoAccelHt = SaltyDataStore.get("TO_EO_ACCEL_HT", 1000);
        let oat = SimVar.GetSimVarValue("AMBIENT TEMPERATURE", "celsius") + "°C";
        let qClb = SaltyDataStore.get("TO_Q_CLB_AT", 1000);

        let windCell = "---°/--KT";
        let clbAt = SaltyDataStore.get("TO_CLB_AT", 3000);
        let rwyHdg;
        let rwyHdWnd;
        let rwyXWnd;
        let rwyHdWndCell = "--KT";
        let rwyXWndCell = "--KT";
        /* LSK3 */
        fmc.onLeftInput[2] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            if (value.length >= 5 && value.length <= 6) {
                value = value.split("/");
                if (value[0]) {
                    fmc._TORwyWindHdg = value[0];
                }
                if (value[1]) {                
                    fmc._TORwyWindSpd = value[1];
                }
            } else if (value == "") {
                fmc.inOut =  fmc._TORwyWindHdg + "/" +  fmc._TORwyWindSpd;
            } else {
                fmc.showErrorMessage(fmc.defaultInputErrorMessage);
            }
            FMCTakeOffPage.ShowPage2(fmc);
        }
        if (fmc._TORwyWindHdg != "" && fmc._TORwyWindSpd != "") {
            windCell = fmc._TORwyWindHdg + "°/" + fmc._TORwyWindSpd.padStart(2, 0) + "KT";
            if (fmc.flightPlanManager.getDepartureRunway()) {
                rwyHdg = fmc.flightPlanManager.getDepartureRunway().direction;
                rwyHdg = parseFloat(rwyHdg).toFixed(0);
                rwyHdWnd =  Math.cos(rwyHdg - fmc._TORwyWindHdg);
                rwyXWnd =  Math.sin(rwyHdg - fmc._TORwyWindHdg);
                console.log(Math.sign(rwyXWnd));
                if (rwyHdWnd > 0) {
                    rwyHdWndCell = (rwyHdWnd * fmc._TORwyWindSpd).toFixed(0) + "KTH";
                } else if (rwyHdWnd == 0) {
                    rwyHdWndCell = (rwyHdWnd * fmc._TORwyWindSpd).toFixed(0) + "KT";
                } else if (rwyHdWnd < 0) {
                    rwyHdWndCell = (rwyHdWnd * fmc._TORwyWindSpd).toFixed(0) + "KTT";
                }
                if (rwyXWnd > 0) {
                    rwyXWndCell = (rwyXWnd * fmc._TORwyWindSpd).toFixed(0) + "KTR";
                } else if (rwyHdWnd == 0) {
                    rwyXWndCell = (rwyXWnd * fmc._TORwyWindSpd).toFixed(0) + "KT";
                } else if (rwyHdWnd < 0) {
                    rwyXWndCell = (rwyXWnd * fmc._TORwyWindSpd).toFixed(0) + "KTL";
                }
            }
        }

        let restoreRate = "SLOW ←→ FAST>";
        let slopeCond = "U0.5/WET"
        let stdLimToGw = "368.0"
        let qClbArmed = "OFF←→ARMED>";
        let n1Pct = fmc.getThrustTakeOffLimit().toFixed(1) + "%";
        
        const updateView = () => {
            fmc.setTemplate([
                ["TAKEOFF REF", "2", "2"],
                ["ALTN THRUST", "EO ACCEL HT"],
                [`<${altnThrust}`, `${eoAccelHt}FT`],
                ["\xa0REF OAT", "Q-CLB AT"],
                [`${oat}`, `${qClb}FT`],
                ["\xa0WIND", "CLB AT"],
                [`${windCell}`, `${clbAt}FT`],
                ["\xa0RWY WIND", "RESTORE RATE"],
                [`${rwyHdWndCell}\xa0\xa0${rwyXWndCell}`, `${restoreRate}`],
                ["\xa0SLOPE/COND", "STD LIM TOGW"],
                [`${slopeCond}`, `${stdLimToGw}`],
                ["__FMCSEPARATOR", "Q_CLB", "N1"],
                ["<INDEX", `${qClbArmed}`, `${n1Pct}`]
            ]);
        }
        updateView();

        fmc.onPrevPage = () => {
            FMCTakeOffPage.ShowPage1(fmc);
        };
        fmc.onNextPage = () => {
            FMCTakeOffPage.ShowPage1(fmc);
        };

        fmc.onLeftInput[5] = () => { B747_8_FMC_InitRefIndexPage.ShowPage1(fmc); };
    }
}
FMCTakeOffPage._timer = 0;
//# sourceMappingURL=B747_8_FMC_TakeOffPage.js.map