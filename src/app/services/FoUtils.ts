import { Injectable, isDevMode } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FoUtils {

  protected debug(source: string, method: string, message: string, data: any = []): void {
    if (isDevMode())
      console.debug(`TCL: ${source.toUpperCase()} -> ${method} -> ${message}`, data);
  }

  protected info(source: string, method: string, message: string, data: any = []): void {
    console.info(`TCL: ${source.toUpperCase()} -> ${method} -> ${message}`, data);
  }

  protected warn(source: string, method: string, message: string, data: any = []): void {
    console.warn(`TCL: ${source.toUpperCase()} -> ${method} -> ${message}`, data);
  }

  protected error(source: string, method: string, message: string, data: any = []): void {
    console.error(`TCL: ${source.toUpperCase()} -> ${method} -> ${message}`, data);
  }

  // Compare object for sorting in Array
  protected compareWith = (obj1: any, obj2: any): boolean => obj1 && obj2 && obj1.id === obj2.id;

  // function to build an Array with unique data 
  protected uniqueFilter = (value: any, index: number, self: any) => self.indexOf(value) === index;


  // function to format to YYYY/MM
  protected period = (year: number, month: number) => year + '/' + (month < 10 ? '0' : '') + month;

  protected periodToYearMonth(input: number): { year: number; month: number } {
    const year = Math.floor(input / 100); // Get the year by dividing by 100
    const month = input % 100;           // Get the month by taking modulo 100
    if (month < 1 || month > 12) {
      throw new Error("Invalid month in input");
    }
    return { year, month };
  }

}
