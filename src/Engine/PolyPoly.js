import Vector from '../Math/Vector'

export default class PolyPoly {
  supportPoint (polygon, direction) {
    let furthest = { vertex: polygon.vertices[0], distance: -Infinity }
    for (let i = 0; i < polygon.vCount; i++) {
      const vertex = polygon.vertices[i]
      const distance = vertex.dot(direction)
      if (distance > furthest.distance) furthest = { vertex, distance }
    }
    return furthest.vertex
  }

  getFace (polygon, index) {
    return {
      a: polygon.vertices[index],
      b: polygon.vertices[(index + 1) % polygon.vCount],
      normal: polygon.normals[index]
    }
  }

  leastPenetrationFace (polygon, other) {
    polygon.calcNormals()
    other.calcNormals()
    let faceIndex = 0
    let minPen = Infinity
    for (let i = 0; i < polygon.vCount; i++) {
      const vertex = polygon.vertices[i]
      const normal = polygon.normals[i]
      const support = this.supportPoint(other, normal.multiply(-1))

      const penetration = normal.multiply(-1).dot(support.sub(vertex))
      if (penetration < minPen) {
        minPen = penetration
        faceIndex = i
      }
    }
    // if(min_pen <= 0) return null;
    return { faceIndex, minPen }
  }

  clipPointsBelow (face, points) {
    const d1 = face.normal.dot(points[0]) - face.normal.dot(face.a)
    const d2 = face.normal.dot(points[1]) - face.normal.dot(face.a)

    const clipped = [Vector.ZERO, Vector.ZERO]
    let clipCount = 0

    // If below face, leave as-is
    if (d1 <= 0.0) clipped[clipCount++] = points[0]
    if (d2 <= 0.0) clipped[clipCount++] = points[1]
    if (clipCount === 2) return { clipped, clipCount }

    // If one point above and other below face, clip
    if (d1 * d2 < 0.0) {
      const t = d1 / (d1 - d2)
      clipped[clipCount++] = points[0].add(points[1].sub(points[0]).multiply(t))
    }

    return { clipped, clipCount }
  }

  incidentFace (polygon, refFaceNormal, skip = []) {
    let minDot = Infinity
    let incFaceIdx = -1
    for (let i = 0; i < polygon.vCount; i++) {
      if (skip.includes(i)) continue
      const dot = polygon.normals[i].dot(refFaceNormal)

      if (dot < minDot) {
        minDot = dot
        incFaceIdx = i
      }
    }

    return {
      a: polygon.vertices[incFaceIdx],
      b: polygon.vertices[(incFaceIdx + 1) % polygon.vCount],
      normal: polygon.normals[incFaceIdx],
      indices: [...skip, incFaceIdx]
    }
  }

  collide (polygon, other) {
    const { faceIndex: polygonFaceIdx, minPen: polygonPen } = this.leastPenetrationFace(polygon, other)
    if (polygonPen <= 0.0) return

    const { faceIndex: otherFaceIdx, minPen: otherPen } = this.leastPenetrationFace(other, polygon)
    if (otherPen <= 0.0) return

    let refPoly, refFaceIdx, incPoly, normal
    if (otherPen >= 0.95 * polygonPen + 0.01 * otherPen) {
      refPoly = polygon
      refFaceIdx = polygonFaceIdx
      incPoly = other
      normal = refPoly.normals[refFaceIdx]
    } else {
      refPoly = other
      refFaceIdx = otherFaceIdx
      incPoly = polygon
      normal = refPoly.normals[refFaceIdx].multiply(-1)
    }
    const refFace = this.getFace(refPoly, refFaceIdx)

    const contacts = []
    let incFace = { indices: [] }

    searchLoop: while (contacts.length === 0) {
      incFace = this.incidentFace(incPoly, refFace.normal, incFace.indices)
      if (!incFace.normal) {
        const d = refFace.normal.dot(refPoly.center) - refFace.normal.dot(refFace.a)
        contacts.push({ position: refPoly.center, penetration: -d, normal, tangent: normal.cross(1) })
        break
      }
      let incPoints = [incFace.a, incFace.b]
      const sideFacesIdx = [
        (refFaceIdx + 1) % refPoly.vCount,
        (refFaceIdx + refPoly.vCount - 1) % refPoly.vCount
      ]
      // Clip by side faces of ref face (not ref face itself)
      for (const sideFaceIdx of sideFacesIdx) {
        const face = this.getFace(refPoly, sideFaceIdx)
        const { clipped, clipCount } = this.clipPointsBelow(face, incPoints)
        if (clipCount < 2) continue searchLoop
        incPoints = clipped
      }

      incPoints.forEach((position) => {
        const d = refFace.normal.dot(position) - refFace.normal.dot(refFace.a)
        if (d < 0.0) {
          contacts.push({ polygon, other, position, penetration: -d, normal, tangent: normal.cross(1) })
        }
      })
    }
    return contacts
  }
}
