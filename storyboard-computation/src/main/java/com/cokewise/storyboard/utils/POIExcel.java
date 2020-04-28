package com.cokewise.storyboard.utils;

import org.apache.poi.hssf.usermodel.HSSFDateUtil;
import org.apache.poi.ss.usermodel.Cell;

import java.text.DateFormat;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.TimeZone;

public class POIExcel {
    public static String getCellValue(Cell cell){
        String cellVal;
        DecimalFormat df = new DecimalFormat("#");
        switch (cell.getCellTypeEnum()){
            case NUMERIC:
                if(HSSFDateUtil.isCellDateFormatted(cell)){
                    DateFormat gmtFormat = new SimpleDateFormat();
                    TimeZone gmtTime = TimeZone.getTimeZone("GMT");
                    gmtFormat.setTimeZone(gmtTime);
                    cellVal = gmtFormat.format(cell.getDateCellValue());
                    break;
                }
                cellVal = df.format(cell.getNumericCellValue());
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
