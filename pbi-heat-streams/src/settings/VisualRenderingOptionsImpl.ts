/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { IVisualRenderingOptions } from './types'

/**
 * PowerBI: Visual Rendering Options
 */
export class VisualRenderingOptionsImpl implements IVisualRenderingOptions {
	public highlightColor = 'gray'
	public rowHeight = 15
	public categoryTextPercent = 10
	public axisHeight = 20
	public rowGap = true
	public colorScheme = 'RdBu'
	public textColor = '#000000'
	public zoomLevel = 1
	public numTicks = 30
	public showValues = true
	public showCategories = true
	public reverseColorScheme = false
}
