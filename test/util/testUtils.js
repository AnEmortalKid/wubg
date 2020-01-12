import fs from "fs";
import path from "path";

export function checkFileExists(filepath) {
  return new Promise((resolve, reject) => {
    fs.access(filepath, fs.F_OK, error => {
      resolve(!error);
    });
  });
}