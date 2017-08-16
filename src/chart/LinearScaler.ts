namespace essex.visuals.heatStreams {
    /**
     * The domain of normalized values. Avoid zero so that log-scaling situations won't explode.
     */
    const MIN = 0.000001;
    const MAX = 1;

    // NOTE: The coloring uses the "Diverging" HCL Pattern described here
    // http://hclwizard.org:64230/hclwizard/
    export class LinearScaler {
        private valueSanitizer: d3.ScaleLinear<number, number>;
        private logScaler: d3.ScaleLogarithmic<number, number>;

        constructor(
            d3: any,
            valueMin,
            valueMax,
            private isLogScaled: boolean,
        ) {
            this.valueSanitizer = d3.scaleLinear().domain([valueMin, valueMax]).range([MIN, MAX]).clamp(true);
            this.logScaler = d3.scaleLog().domain([MIN, MAX]).range([MIN, MAX]);
        }

        public scale(value: number) {
            if (value === null) {
                return value;
            }
            const sanitized = this.valueSanitizer(value);
            return this.isLogScaled ? this.logScaler(sanitized) : sanitized;
        }
    }
}