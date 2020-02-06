/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import * as React from 'react'
import { memo, useState, useCallback, useMemo } from 'react'
import { scaleLinear, scaleTime } from 'd3-scale'
import {
	DateAggregation,
	ICategory,
	ICategorySelectionMap,
	ICategoryValueMap,
	IColorizer,
	Scrub,
	XDomain,
	TimeDomain,
} from '../interfaces'
import { getSliceEnd } from '../utils'
import { CategoryList } from './CategoryList'

export interface IHeatStreamsState {
	scrollPosition: number
	panPosition: number
}

export interface IHeatStreamsChartProps {
	width: number
	height: number
	textPercent: number
	rowHeight: number
	axisHeight: number
	numTicks: number
	zoomLevel: number
	xDomain: XDomain
	highlightColor: string
	showCategories: boolean
	rowGap: boolean
	showValues: boolean
	timeScrub: TimeDomain
	colorizer: IColorizer
	categories: ICategory[]
	categoryValues: ICategoryValueMap
	selections: ICategorySelectionMap
	numericAggregation?: number
	dateAggregation?: DateAggregation
	onClearSelection: () => void
	onClickCategory: (category: ICategory, ctrl: boolean) => void
	onScrub: (bounds: Scrub) => void
}

export const HeatStreamsChart: React.FC<IHeatStreamsChartProps> = memo(
	({
		colorizer,
		timeScrub,
		width,
		height,
		textPercent,
		showCategories,
		showValues,
		rowHeight,
		axisHeight,
		highlightColor,
		rowGap,
		categoryValues,
		selections,
		numTicks,
		xDomain,
		onClickCategory,
		onClearSelection,
		zoomLevel,
		numericAggregation,
		dateAggregation,
		categories,
		onScrub,
	}) => {
		const [panPosition, setPanPosition] = useState(0)
		const [scrollPosition, setScrollPosition] = useState(0)
		const getXScale = useCallback(
			(domain: XDomain): any => {
				const rangeStart = showCategories ? width * textPercent : 0
				const range = [rangeStart, width * zoomLevel]
				const isNumberDomain = typeof domain[0] === 'number'
				if (isNumberDomain) {
					return scaleLinear()
						.domain(domain)
						.range(range)
				} else {
					return scaleTime()
						.domain(domain)
						.range(range)
				}
			},
			[showCategories, textPercent, width, zoomLevel],
		)
		const xScale = useMemo(() => getXScale(xDomain), [getXScale, xDomain])
		const axisOffset = useMemo(() => {
			return Math.min(
				height - axisHeight,
				categories.length * rowHeight + axisHeight,
			)
		}, [categories, axisHeight, rowHeight, height])

		const sliceWidth = useMemo(() => {
			const start = xDomain[0]
			const end = getSliceEnd(start, numericAggregation, dateAggregation)
			return xScale(end) - xScale(start)
		}, [xScale, xDomain, numericAggregation, dateAggregation])

		const categoryY = (index: number): number =>
			rowHeight * index + (rowGap ? index : 0)

		const isCategorySelected = (cat: ICategory): boolean =>
			!!selections[cat.name]
		const categoryTextWidth = width * textPercent
		const chartWidth = width - categoryTextWidth

		const maxCategories = useMemo(() => {
			const gap = rowGap ? 1 : 0
			return Math.floor((height - axisHeight) / (rowHeight + gap))
		}, [rowGap, height, axisHeight, rowHeight])

		const categoryOffsetStart = useMemo(() => {
			let categoryOffsetStart = Math.floor(scrollPosition / rowHeight)
			if (categories.length < categoryOffsetStart) {
				categoryOffsetStart = categories.length - maxCategories
			}
			return categoryOffsetStart
		}, [maxCategories, scrollPosition, rowHeight, categories.length])

		const categoriesInView = useMemo(() => {
			return categories.slice(
				categoryOffsetStart,
				categoryOffsetStart + maxCategories,
			)
		}, [categoryOffsetStart, maxCategories, categories])

		const onClick = useCallback(
			(x: number, y: number, ctrlKey: boolean): void => {
				if (timeScrub) {
					onClearSelection()
				} else {
					const gap = rowGap ? 1 : 0
					const category = categoriesInView[Math.floor(y / (rowHeight + gap))]
					if (category) {
						onClickCategory(category, ctrlKey)
					} else {
						onClearSelection()
					}
				}
			},
			[
				categoriesInView,
				onClearSelection,
				onClickCategory,
				rowGap,
				rowHeight,
				timeScrub,
			],
		)

		const onScroll = useCallback(
			(deltaX: number, deltaY: number): void => {
				const newPanPos =
					zoomLevel === 1 ? 0 : Math.min(0, panPosition - deltaX)
				const newScrollPos = Math.max(0, scrollPosition + deltaY)
				setPanPosition(newPanPos)
				setScrollPosition(newScrollPos)
			},
			[panPosition, scrollPosition, zoomLevel],
		)

		return (
			<svg height={height} width={width}>
				<defs>
					<clipPath id="clip-chart">
						<rect
							x={categoryTextWidth}
							y="0"
							width={chartWidth}
							height={height}
						/>
					</clipPath>
					<clipPath id="clip-category-text">
						<rect x="0" y="0" width={categoryTextWidth} height={height} />
					</clipPath>
				</defs>
				<CategoryList
					height={height}
					width={width}
					axisHeight={axisHeight}
					axisOffset={axisOffset}
					categoryY={categoryY}
					categories={categoriesInView}
					categoryValues={categoryValues}
					textPercent={textPercent}
					showCategories={showCategories}
					rowHeight={rowHeight}
					highlightColor={highlightColor}
					showValues={showValues}
					colorizer={colorizer}
					xScale={xScale}
					xDomain={xDomain}
					numAxisTicks={numTicks}
					isCategorySelected={isCategorySelected}
					sliceWidth={sliceWidth}
					onClickCategory={onClickCategory}
					onClick={onClick}
					onScroll={onScroll}
					onScrub={onScrub}
					xPan={panPosition}
					timeScrub={timeScrub}
					onClear={onClearSelection}
				/>
			</svg>
		)
	},
)
HeatStreamsChart.displayName = 'HeatStreamsChart'
