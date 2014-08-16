#!/bin/bash
#
# @author Dani Huertas
# @email huertas.dani@gmail.com
# @date Thu Aug 14 17:30:10 CEST 2014
#

# TODO optional conversion from lon,lat,alt to x,y,z coordinates

if [ $# -lt 1 ]
then 
  echo "Usage $0 path/to/file.gpx [line-offset]"
  exit 0
fi

if [ ! -f $1 ]; then
  echo "File $1 not found!"
  exit 0
fi

OFFSET_LINE=0

if [ $2 -gt 0 ]
then
  OFFSET_LINE=$2
fi

START_LINE=$(( $(grep -n "<trkseg>" $1 | head -1 | awk -F: '{print $1}') + 1 + $OFFSET_LINE))
DATA_OUT=$(echo $1 | sed 's/gpx/dat/g')
PLOT_OUT=$(echo $1 | sed 's/gpx/plot/g');

### skip first N lines
cat $1 | tail -n +$START_LINE | \
### grep latitude, longitude, elevation and time
grep "lat\|lon\|ele\|time" | \
### group three lines 
awk '{ if (NR%3 == 0) print $0; else printf "%s", $0}' | \
### remove stuff
sed -e 's/[<\/>,]//g' -e 's/ele//g' -e 's/time//g' -e 's/lat=//g' -e 's/lon=//g' -e 's/"//g' | \
### print lines to output file
awk '{print $2"\t"$3"\t"$4"\t"$5}' > $DATA_OUT

### create gnuplot file
echo "set terminal wxt" >  $PLOT_OUT
echo "set ticslevel 0" >> $PLOT_OUT
echo "set zrange [0:*]" >> $PLOT_OUT
echo "set xlabel 'latitude'" >> $PLOT_OUT
echo "set ylabel 'longitude'" >> $PLOT_OUT
echo "set zlabel 'altitude'" >> $PLOT_OUT
echo "unset key" >> $PLOT_OUT
echo "splot '$DATA_OUT' using 1:2:3:3 w impulses lw 2 lc palette, \\" >> $PLOT_OUT
echo "'' using 1:2:3 lc rgb 'black' lt 2 lw 0.5 w l" >> $PLOT_OUT

### plot data
gnuplot $PLOT_OUT -persist

### clean up
#rm $DATA_OUT
#rm $PLOT_OUT
