package com.cokewise.storyboard.utils;

import org.apache.poi.ss.usermodel.Cell;

import java.text.DecimalFormat;

public class POIExcel {
    public static String getCellValue(Cell cell){
        String cellVal = "";
        DecimalFormat df = new DecimalFormat("#");
        switch (cell.getCellTypeEnum()){
            case NUMERIC:
                cellVal = df.format(cell.getNumericCellValue()).toString();
                break;
            case STRING:
                cellVal = cell.getRichStringCellValue().getString().trim();
                break;
            case BOOLEAN:
                cellVal = String.valueOf(cell.getBooleanCellValue()).trim();
                break;
            case FORMULA:
                cellVal = cell.getCellFormula();
                break;
            default:
                cellVal = "";
                break;
        }
        return cellVal;
    }
}
