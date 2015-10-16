<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="*">
	<xsl:apply-templates/>
</xsl:template>

<xsl:template match="docHit | facet | parameters | query"/>

<!--
<xsl:template match="facet[@field='facet-category-student-all']">
<h3>Restrict your search to a student publication</h3>
<div class="advancedsearchcheckboxes">
<xsl:apply-templates select="group">
	<xsl:with-param name="firstpart" select="''"/>
</xsl:apply-templates>
</div>
<p><a class="selectall" href="#">Select all</a> | <a class="deselectall" href="#">deselect all</a></p>
</xsl:template>
-->

<xsl:template match="facet[@field='facet-category']">
<h3>Restrict your search to a university publication</h3>
<div class="advancedsearchcheckboxes advancedsearchbox">
<xsl:apply-templates select="group[@value='university']/group">
	<xsl:with-param name="firstpart" select="'2'"/>
</xsl:apply-templates>
</div>
<p><a class="selectall" href="#">Select all</a> | <a class="deselectall" href="#">deselect all</a></p>
</xsl:template>

<xsl:template match="group">
<xsl:param name="firstpart"/>
<input name="f{position()}-title" type="checkbox" value="{@value}"/>
<xsl:text> </xsl:text>
<xsl:value-of select="@value"/>
<br/>
</xsl:template>

</xsl:stylesheet>
