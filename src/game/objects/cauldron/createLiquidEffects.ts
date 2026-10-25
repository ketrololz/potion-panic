import { prefersReducedMotion } from '../../../shared/prefersReducedMotion'
import { Filter, GlProgram } from 'pixi.js'
import type { Container } from 'pixi.js'
import vertex from './shaders/liquid.vert?raw'
import fragment from './shaders/liquid.frag?raw'
import { LIQUID_FX as FX } from './constants/liquidEffects.constants'

export function createLiquidEffects(liquid: Container) {
    const reducedMotion = prefersReducedMotion()
    const uniforms = {
        uTime: { value: 0, type: 'f32' },
        uPadding: { value: FX.padding, type: 'f32' },
        uEdgeAmplitude: { value: FX.edgeAmplitude, type: 'f32' },
        uAmplitudeX: { value: FX.amplitudeX, type: 'f32' },
        uAmplitudeY: { value: FX.amplitudeY, type: 'f32' },
        uShimmer: { value: FX.shimmer, type: 'f32' },
        uBoilAmplitude: { value: FX.boilAmplitude, type: 'f32' },
        uBoilSpeed: { value: FX.boilSpeed, type: 'f32' },
        uImpactAge: { value: FX.impactDuration, type: 'f32' },
        uImpactDuration: { value: FX.impactDuration, type: 'f32' },
        uImpactAmplitude: { value: FX.impactAmplitude, type: 'f32' }
    } as const
    const filter = reducedMotion
        ? undefined
        : new Filter({
              glProgram: GlProgram.from({ vertex, fragment, name: 'potion-liquid' }),
              resources: { liquidUniforms: uniforms },
              padding: FX.padding
          })
    if (filter) liquid.filters = [...(liquid.filters ?? []), filter]

    function update(deltaMs: number) {
        if (!filter) return
        const seconds = Math.max(0, Math.min(deltaMs, FX.maxDeltaMs)) / 1000
        const values = filter.resources.liquidUniforms.uniforms
        values.uTime += seconds * FX.speed
        values.uImpactAge = Math.min(FX.impactDuration, values.uImpactAge + seconds)
    }
    function impact() {
        if (filter) filter.resources.liquidUniforms.uniforms.uImpactAge = 0
    }
    function reset() {
        if (!filter) return
        filter.resources.liquidUniforms.uniforms.uTime = 0
        filter.resources.liquidUniforms.uniforms.uImpactAge = FX.impactDuration
    }
    liquid.once('destroyed', () => filter?.destroy())
    return { update, impact, reset }
}
